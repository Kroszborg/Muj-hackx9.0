'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Wallet } from "lucide-react"

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
    keplr?: {
      enable: (chainId: string) => Promise<void>;
      getOfflineSigner: (chainId: string) => {
        getAccounts: () => Promise<{ address: string }[]>;
      };
    };
  }
}

type WalletType = 'MetaMask' | 'Phantom' | 'Keplr';

export function MultiWalletConnect() {
  const [isOpen, setIsOpen] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<WalletType | null>(null)
  const [account, setAccount] = useState('')

  useEffect(() => {
    checkConnections()

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0])
      } else {
        disconnectWallet()
      }
    }

    if (typeof window.ethereum !== 'undefined' && window.ethereum.on) {
      window.ethereum.on('accountsChanged', (accounts) => handleAccountsChanged(accounts as string[]))
    }

    if (typeof window.solana !== 'undefined' && window.solana.on) {
      window.solana.on('accountChanged', (publicKey) => {
        const pk = publicKey as { toString: () => string } | null;
        if (pk) {
          setAccount(pk.toString())
        } else {
          disconnectWallet()
        }
      })
    }

    return () => {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged as (...args: unknown[]) => void)
      }
      if (typeof window.solana !== 'undefined' && window.solana.removeListener) {
        window.solana.removeListener('accountChanged', () => {})
      }
    }
  }, [])

  const checkConnections = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setConnectedWallet('MetaMask')
          return
        }
      } catch (error) {
        console.error("Failed to check MetaMask connection", error)
      }
    }

    if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect()
        setAccount(resp.publicKey.toString())
        setConnectedWallet('Phantom')
        return
      } catch {
        // User is not connected to Phantom
      }
    }

    if (typeof window.keplr !== 'undefined') {
      try {
        await window.keplr.enable('cosmoshub-4')
        const offlineSigner = window.keplr.getOfflineSigner('cosmoshub-4')
        const accounts = await offlineSigner.getAccounts()
        if (accounts.length > 0) {
          setAccount(accounts[0].address)
          setConnectedWallet('Keplr')
          return
        }
      } catch (error) {
        console.error("Failed to check Keplr connection", error)
      }
    }
  }

  const connectWallet = async (walletType: WalletType) => {
    try {
      switch (walletType) {
        case 'MetaMask':
          if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' })
            const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
            setAccount(accounts[0])
            setConnectedWallet('MetaMask')
          } else {
            throw new Error('MetaMask not detected')
          }
          break
        case 'Phantom':
          if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
            const resp = await window.solana.connect()
            setAccount(resp.publicKey.toString())
            setConnectedWallet('Phantom')
          } else {
            throw new Error('Phantom not detected')
          }
          break
        case 'Keplr':
          if (typeof window.keplr !== 'undefined') {
            await window.keplr.enable('cosmoshub-4')
            const offlineSigner = window.keplr.getOfflineSigner('cosmoshub-4')
            const accounts = await offlineSigner.getAccounts()
            setAccount(accounts[0].address)
            setConnectedWallet('Keplr')
          } else {
            throw new Error('Keplr not detected')
          }
          break
      }
      setIsOpen(false)
    } catch (error) {
      console.error(`Failed to connect to ${walletType}`, error)
    }
  }

  const disconnectWallet = () => {
    setConnectedWallet(null)
    setAccount('')
    setIsOpen(false)
  }

  return (
    <>
      <Button 
        onClick={() => connectedWallet ? setIsOpen(true) : setIsOpen(true)} 
        variant="outline" 
        size="sm"
        aria-label={connectedWallet ? "Manage wallet connection" : "Connect wallet"}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {connectedWallet ? `${connectedWallet} Connected` : 'Connect Wallet'}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{connectedWallet ? 'Manage Connection' : 'Connect Wallet'}</DialogTitle>
            <DialogDescription>
              {connectedWallet 
                ? `You are connected with ${connectedWallet}. Account: ${account.slice(0, 6)}...${account.slice(-4)}`
                : "Choose a wallet to connect:"}
            </DialogDescription>
          </DialogHeader>
          {connectedWallet ? (
            <Button onClick={disconnectWallet} variant="destructive">
              Disconnect
            </Button>
          ) : (
            <div className="flex flex-col space-y-2">
              <Button onClick={() => connectWallet('MetaMask')} disabled={typeof window.ethereum === 'undefined'}>
                Connect MetaMask
              </Button>
              <Button onClick={() => connectWallet('Phantom')} disabled={typeof window.solana === 'undefined' || !window.solana.isPhantom}>
                Connect Phantom
              </Button>
              <Button onClick={() => connectWallet('Keplr')} disabled={typeof window.keplr === 'undefined'}>
                Connect Keplr
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
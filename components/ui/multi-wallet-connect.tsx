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
import Cookies from 'js-cookie'  // Make sure to install this package: npm install js-cookie

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
      isConnected: () => Promise<boolean>;
      publicKey: { toString: () => string } | null;
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
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0])
        refreshCookies(connectedWallet!, accounts[0])
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
          refreshCookies(connectedWallet!, pk.toString())
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
  }, [connectedWallet])

  const refreshCookies = (walletType: WalletType, accountAddress: string) => {
    // Set cookies with wallet information
    Cookies.set('walletType', walletType, { expires: 7 }) // expires in 7 days
    Cookies.set('accountAddress', accountAddress, { expires: 7 })
    
    // You might want to trigger a page reload or update app state here
    // window.location.reload()
    console.log('Cookies refreshed with new wallet information')
  }

  const checkExistingConnection = async (walletType: WalletType): Promise<boolean> => {
    try {
      switch (walletType) {
        case 'MetaMask':
          if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
            if (accounts.length > 0) {
              setAccount(accounts[0])
              setConnectedWallet('MetaMask')
              refreshCookies('MetaMask', accounts[0])
              return true
            }
          }
          break
        case 'Phantom':
          if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
            const isConnected = await window.solana.isConnected()
            if (isConnected) {
              const publicKey = window.solana.publicKey
              if (publicKey) {
                setAccount(publicKey.toString())
                setConnectedWallet('Phantom')
                refreshCookies('Phantom', publicKey.toString())
                return true
              }
            }
          }
          break
        case 'Keplr':
          if (typeof window.keplr !== 'undefined') {
            try {
              const offlineSigner = window.keplr.getOfflineSigner('cosmoshub-4')
              const accounts = await offlineSigner.getAccounts()
              if (accounts.length > 0) {
                setAccount(accounts[0].address)
                setConnectedWallet('Keplr')
                refreshCookies('Keplr', accounts[0].address)
                return true
              }
            } catch {
              // Silent fail if not already connected
            }
          }
          break
      }
      return false
    } catch (error) {
      console.error(`Failed to check ${walletType} connection:`, error)
      return false
    }
  }

  const connectWallet = async (walletType: WalletType) => {
    try {
      // Check for existing connection only when user initiates
      const isConnected = await checkExistingConnection(walletType)
      if (isConnected) {
        setIsOpen(false)
        return
      }

      // If not connected, proceed with connection
      switch (walletType) {
        case 'MetaMask':
          if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' })
            const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
            setAccount(accounts[0])
            setConnectedWallet('MetaMask')
            refreshCookies('MetaMask', accounts[0])
          } else {
            throw new Error('MetaMask not detected')
          }
          break
        case 'Phantom':
          if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
            const resp = await window.solana.connect()
            setAccount(resp.publicKey.toString())
            setConnectedWallet('Phantom')
            refreshCookies('Phantom', resp.publicKey.toString())
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
            refreshCookies('Keplr', accounts[0].address)
          } else {
            throw new Error('Keplr not detected')
          }
          break
      }
      setIsOpen(false)
    } catch (error) {
      console.error(`Failed to connect to ${walletType}:`, error)
      alert(`Failed to connect to ${walletType}. Please make sure the wallet is installed and try again.`)
    }
  }

  const disconnectWallet = () => {
    setConnectedWallet(null)
    setAccount('')
    setIsOpen(false)
    // Clear cookies on disconnect
    Cookies.remove('walletType')
    Cookies.remove('accountAddress')
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
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
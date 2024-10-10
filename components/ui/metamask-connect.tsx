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
  }
}

export function MetaMaskConnect() {
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState('')

  useEffect(() => {
    checkConnection()

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
      } else {
        setIsConnected(false)
        setAccount('')
      }
    }

    if (typeof window.ethereum !== 'undefined' && window.ethereum.on) {
      window.ethereum.on('accountsChanged', (accounts) => handleAccountsChanged(accounts as string[]))
    }

    return () => {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged as (...args: unknown[]) => void)
      }
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Failed to check MetaMask connection", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
        setAccount(accounts[0])
        setIsConnected(true)
        setIsOpen(false)
      } catch (error) {
        console.error("Failed to connect to MetaMask", error)
      }
    } else {
      console.log('MetaMask not detected')
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount('')
    setIsOpen(false)
  }

  return (
    <>
      <Button 
        onClick={() => isConnected ? setIsOpen(true) : connectWallet()} 
        variant="outline" 
        size="sm"
        aria-label={isConnected ? "Manage wallet connection" : "Connect wallet"}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnected ? 'Connected' : 'Connect Wallet'}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isConnected ? 'Manage Connection' : 'Connect to MetaMask'}</DialogTitle>
            <DialogDescription>
              {isConnected 
                ? `You are connected with account ${account.slice(0, 6)}...${account.slice(-4)}`
                : typeof window.ethereum !== 'undefined' 
                  ? "Click the button below to connect your MetaMask wallet."
                  : "MetaMask is not detected. Please install MetaMask and refresh the page."}
            </DialogDescription>
          </DialogHeader>
          {isConnected ? (
            <Button onClick={disconnectWallet} variant="destructive">
              Disconnect
            </Button>
          ) : typeof window.ethereum !== 'undefined' ? (
            <Button onClick={connectWallet}>
              Connect MetaMask
            </Button>
          ) : (
            <Button asChild>
              <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">
                Install MetaMask
              </a>
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
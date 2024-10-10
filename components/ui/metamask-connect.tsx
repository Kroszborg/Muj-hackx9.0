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
    };
  }
}

export function MetaMaskConnect() {
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState('')

  useEffect(() => {
    checkConnection()
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
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
        <Wallet className="mr-2 h-4 w-4" />
        {isConnected ? 'Connected' : 'Connect Wallet'}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to MetaMask</DialogTitle>
            <DialogDescription>
              {typeof window.ethereum !== 'undefined' 
                ? "Click the button below to connect your MetaMask wallet."
                : "MetaMask is not detected. Please install MetaMask and refresh the page."}
            </DialogDescription>
          </DialogHeader>
          {typeof window.ethereum !== 'undefined' ? (
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
          {isConnected && (
            <>
              <p className="text-sm text-muted-foreground">
                Connected Account: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
              <Button onClick={disconnectWallet} variant="outline" size="sm">
                Disconnect
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
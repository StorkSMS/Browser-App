"use client"

import type React from "react"
import { useMemo, useEffect } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import {
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { useStandardWalletAdapters } from "@solana/wallet-standard-wallet-adapter-react"
import { MWARegistration } from "./mwa-registration"

interface WalletContextProviderProps {
  children: React.ReactNode
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
  // Network selection: Use environment variable for testing, otherwise devnet
  const network = useMemo(() => {
    if (typeof window !== 'undefined') {
      // Client-side: check for testing override
      return process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet' 
        ? WalletAdapterNetwork.Mainnet 
        : WalletAdapterNetwork.Devnet
    }
    return WalletAdapterNetwork.Devnet
  }, [])

  // Use public RPC endpoints for wallet adapter (only used for wallet connection, not sensitive operations)
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // Get standard wallet adapters (includes MWA)
  const standardAdapters = useStandardWalletAdapters([])

  // Debug logging - run after component mounts
  useEffect(() => {
    console.log("🔍 WALLET PROVIDER DEBUG:")
    console.log("Standard adapters found:", standardAdapters.length)
    standardAdapters.forEach((adapter, index) => {
      console.log(`Adapter ${index}:`, adapter.name, adapter)
    })
  }, [standardAdapters])

  // Combine standard adapters with legacy adapters
  const wallets = useMemo(
    () => {
      const allWallets = [
        ...standardAdapters,
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
      ]
      console.log("Total wallets available:", allWallets.length)
      allWallets.forEach((wallet, index) => {
        console.log(`Wallet ${index}:`, wallet.name)
      })
      return allWallets
    },
    [standardAdapters],
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <MWARegistration />
        {children}
      </WalletProvider>
    </ConnectionProvider>
  )
}

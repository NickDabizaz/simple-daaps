// src/components/MintForm.jsx
import React, { useState } from "react"
import { ethers } from "ethers"

export default function MintForm({ contract, account, fetchBalance, setStatus }) {
  // State untuk menyimpan jumlah mint
  const [mintAmount, setMintAmount] = useState("")

  // Fungsi untuk memanggil mint di kontrak
  async function handleMint(e) {
    e.preventDefault()
    if (!contract) {
      setStatus("Contract is not defined.")
      return
    }

    try {
      setStatus("Minting tokens...")
      const amountWei = ethers.utils.parseUnits(mintAmount, 18)
      // Mint token ke address "account" (bisa diganti alamat lain)
      const tx = await contract.mint(account, amountWei)
      await tx.wait()

      setStatus(`Mint success! Tx hash: ${tx.hash}`)
      // Refresh saldo
      await fetchBalance()
    } catch (err) {
      console.error(err)
      setStatus(`Mint failed: ${err.message}`)
    }
  }

  return (
    <form onSubmit={handleMint} style={{ marginBottom: "1rem" }}>
      <h3>Mint Token (Owner Only)</h3>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>Amount to Mint: </label>
        <input
          type="number"
          placeholder="0"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          required
        />
      </div>

      <button type="submit">Mint</button>
    </form>
  )
}

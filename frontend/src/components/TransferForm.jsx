// src/components/TransferForm.jsx
import React, { useState } from "react"
import { ethers } from "ethers"

export default function TransferForm({ contract, fetchBalance, setStatus }) {
  // State untuk menyimpan input recipient dan jumlah yang akan ditransfer
  const [to, setTo] = useState("")
  const [amount, setAmount] = useState("")

  // Fungsi untuk meng-handle submit form
  async function handleTransfer(e) {
    e.preventDefault() // mencegah reload halaman
    if (!contract) {
      setStatus("Error: Contract is not defined")
      return
    }

    try {
      setStatus("Sending transfer transaction...")
      // Konversi amount ke BigNumber (asumsi decimals = 18)
      const amountWei = ethers.utils.parseUnits(amount, 18)
      // Panggil fungsi transfer di kontrak
      const tx = await contract.transfer(to, amountWei)
      // Tunggu transaksi selesai
      await tx.wait()

      setStatus(`Transfer success! Tx hash: ${tx.hash}`)
      // Setelah sukses, refresh saldo
      await fetchBalance()
    } catch (err) {
      console.error(err)
      setStatus(`Transfer failed: ${err.message}`)
    }
  }

  return (
    <form onSubmit={handleTransfer} style={{ marginBottom: "1rem" }}>
      <h3>Transfer Token</h3>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>Recipient Address: </label>
        <input
          type="text"
          placeholder="0x..."
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>Amount: </label>
        <input
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <button type="submit">Transfer</button>
    </form>
  )
}

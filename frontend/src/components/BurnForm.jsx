// src/components/BurnForm.jsx
import React, { useState } from "react"
import { ethers } from "ethers"

export default function BurnForm({ contract, fetchBalance, setStatus }) {
  // State untuk jumlah burn
  const [burnAmount, setBurnAmount] = useState("")

  // Fungsi panggil burn
  async function handleBurn(e) {
    e.preventDefault()
    if (!contract) {
      setStatus("Contract is not defined.")
      return
    }

    try {
      setStatus("Burning tokens...")
      const amountWei = ethers.utils.parseUnits(burnAmount, 18)
      const tx = await contract.burn(amountWei)
      await tx.wait()

      setStatus(`Burn success! Tx hash: ${tx.hash}`)
      // Refresh saldo
      await fetchBalance()
    } catch (err) {
      console.error(err)
      setStatus(`Burn failed: ${err.message}`)
    }
  }

  return (
    <form onSubmit={handleBurn} style={{ marginBottom: "1rem" }}>
      <h3>Burn Token</h3>
      <div style={{ marginBottom: "0.5rem" }}>
        <label>Amount to Burn: </label>
        <input
          type="number"
          placeholder="0"
          value={burnAmount}
          onChange={(e) => setBurnAmount(e.target.value)}
          required
        />
      </div>
      <button type="submit">Burn</button>
    </form>
  )
}

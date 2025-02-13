import React, { useState } from "react";
import { ethers } from "ethers";

export default function BurnForm({ contract, fetchBalance, setStatus }) {
  const [burnAmount, setBurnAmount] = useState("");

  async function handleBurn(e) {
    e.preventDefault();
    if (!contract) return setStatus("Contract is not defined.");

    try {
      setStatus("Burning tokens...");
      const tx = await contract.burn(ethers.utils.parseUnits(burnAmount, 18));
      await tx.wait();
      setStatus(`Burn successful! Tx hash: ${tx.hash}`);
      await fetchBalance();
    } catch (err) {
      setStatus(`Burn failed: ${err.message}`);
    }
  }

  return (
    <form onSubmit={handleBurn} style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", maxWidth: "400px", margin: "auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Burn Tokens</h3>

      <label>Amount to Burn:</label>
      <input
        type="number"
        placeholder="0"
        value={burnAmount}
        onChange={(e) => setBurnAmount(e.target.value)}
        required
        style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
      />

      <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}>
        Burn
      </button>
    </form>
  );
}

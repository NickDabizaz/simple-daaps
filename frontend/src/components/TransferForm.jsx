import React, { useState } from "react";
import { ethers } from "ethers";

export default function TransferForm({ contract, fetchBalance, setStatus }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  async function handleTransfer(e) {
    e.preventDefault();
    if (!contract) return setStatus("Error: Contract is not defined");

    try {
      setStatus("Processing transfer...");
      const tx = await contract.transfer(to, ethers.utils.parseUnits(amount, 18));
      await tx.wait();
      setStatus(`Transfer successful! Tx hash: ${tx.hash}`);
      await fetchBalance();
    } catch (err) {
      setStatus(`Transfer failed: ${err.message}`);
    }
  }

  return (
    <form onSubmit={handleTransfer} style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", maxWidth: "400px", margin: "auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Transfer Tokens</h3>

      <label>Recipient Address:</label>
      <input
        type="text"
        placeholder="0x..."
        value={to}
        onChange={(e) => setTo(e.target.value)}
        required
        style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
      />

      <label>Amount:</label>
      <input
        type="number"
        placeholder="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
      />

      <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}>
        Transfer
      </button>
    </form>
  );
}

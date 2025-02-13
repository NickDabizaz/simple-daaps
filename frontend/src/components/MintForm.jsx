import React, { useState } from "react";
import { ethers } from "ethers";

export default function MintForm({ contract, account, fetchBalance, setStatus }) {
  const [mintAmount, setMintAmount] = useState("");

  async function handleMint(e) {
    e.preventDefault();
    if (!contract) return setStatus("Contract is not defined.");

    try {
      setStatus("Minting tokens...");
      const tx = await contract.mint(account, ethers.utils.parseUnits(mintAmount, 18));
      await tx.wait();
      setStatus(`Mint successful! Tx hash: ${tx.hash}`);
      await fetchBalance();
    } catch (err) {
      setStatus(`Mint failed: ${err.message}`);
    }
  }

  return (
    <form onSubmit={handleMint} style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", maxWidth: "400px", margin: "auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Mint Tokens (Owner Only)</h3>

      <label>Amount to Mint:</label>
      <input
        type="number"
        placeholder="0"
        value={mintAmount}
        onChange={(e) => setMintAmount(e.target.value)}
        required
        style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
      />

      <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}>
        Mint
      </button>
    </form>
  );
}

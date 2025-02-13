import React, { useState } from "react";
import { ethers } from "ethers";

export default function TransferForm({ contract, fetchBalance, setStatus }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  async function handleTransfer(e) {
    e.preventDefault();
    if (!contract) return setStatus("Error: Contract is not defined");

    try {
      setStatus("Sending transfer transaction...");
      const tx = await contract.transfer(to, ethers.utils.parseUnits(amount, 18));
      await tx.wait();
      setStatus(`Transfer success! Tx hash: ${tx.hash}`);
      await fetchBalance();
    } catch (err) {
      setStatus(`Transfer failed: ${err.message}`);
    }
  }

  return (
    <form onSubmit={handleTransfer} className="mt-4">
      <h3 className="text-lg font-semibold">Transfer Token</h3>

      <div className="mt-2">
        <label className="block">Recipient Address:</label>
        <input
          type="text"
          placeholder="0x..."
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="mt-2">
        <label className="block">Amount:</label>
        <input
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
      </div>

      <button type="submit" className="mt-3 px-4 py-2 bg-blue-500 text-white rounded">
        Transfer
      </button>
    </form>
  );
}

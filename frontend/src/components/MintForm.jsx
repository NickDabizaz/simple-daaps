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
      setStatus(`Mint success! Tx hash: ${tx.hash}`);
      await fetchBalance();
    } catch (err) {
      setStatus(`Mint failed: ${err.message}`);
    }
  }

  return (
    <form onSubmit={handleMint} className="mt-4">
      <h3 className="text-lg font-semibold">Mint Token (Owner Only)</h3>
      <input type="number" placeholder="0" value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} required className="border p-2 rounded w-full mt-2" />
      <button type="submit" className="mt-2 px-4 py-2 bg-green-500 text-white rounded">Mint</button>
    </form>
  );
}

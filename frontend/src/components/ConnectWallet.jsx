import React from "react";

export default function ConnectWallet({ account, onClickConnect }) {
  return (
    <div className="mt-4">
      {account ? <p>Wallet Connected: <b>{account}</b></p> : <button onClick={onClickConnect} className="px-4 py-2 bg-blue-500 text-white rounded">Connect Wallet</button>}
    </div>
  );
}

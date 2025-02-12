// src/components/ConnectWallet.jsx
import React from "react"

export default function ConnectWallet({ account, onClickConnect }) {
  // Komponen ini menampilkan tombol "Connect Wallet"
  // atau menampilkan alamat jika sudah terkoneksi
  return (
    <div style={{ marginBottom: "1rem" }}>
      {account ? (
        <p>
          {/* Menampilkan alamat wallet jika sudah connect */}
          Wallet Connected: <b>{account}</b>
        </p>
      ) : (
        <button onClick={onClickConnect}>
          {/* Tombol untuk memicu connect */}
          Connect Wallet
        </button>
      )}
    </div>
  )
}

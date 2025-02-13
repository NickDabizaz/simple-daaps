import React from "react";

export default function ConnectWallet({ account, onClickConnect }) {
  return (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      {account ? (
        <p style={{ fontSize: "16px", fontWeight: "bold", color: "#4caf50" }}>Wallet Connected: {account}</p>
      ) : (
        <button
          onClick={onClickConnect}
          style={{
            padding: "10px 15px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.background = "#0056b3")}
          onMouseOut={(e) => (e.target.style.background = "#007bff")}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

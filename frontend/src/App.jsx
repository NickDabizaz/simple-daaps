import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import MyTokenArtifact from "./abi/MyToken.json";
import ConnectWallet from "./components/ConnectWallet";
import TransferForm from "./components/TransferForm";
import MintForm from "./components/MintForm";
import BurnForm from "./components/BurnForm";

const CONTRACT_ADDRESS = "0x89b6aFA21A15d80E545dFB64A54E28637CEb9505";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [ethBalance, setEthBalance] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [status, setStatus] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("Error: Metamask not detected. Please install Metamask.");
      return;
    }

    try {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const _signer = _provider.getSigner();
      const _account = await _signer.getAddress();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);

      const _contract = new ethers.Contract(CONTRACT_ADDRESS, MyTokenArtifact.abi, _signer);
      setContract(_contract);

      await _signer.signMessage("Signing into MyToken DApp!");
      setStatus("Wallet connected successfully.");
    } catch (err) {
      setStatus("Failed to connect wallet: " + err.message);
    }
  }

  function disconnectWallet() {
    setProvider(null);
    setSigner(null);
    setAccount("");
    setContract(null);
    setIsOwner(false);
    setEthBalance("0");
    setTokenBalance("0");
    setStatus("Wallet disconnected.");
  }

  async function fetchBalance() {
    if (!provider || !account || !contract) return;

    try {
      const ethBal = ethers.utils.formatEther(await provider.getBalance(account));
      const tokenBal = ethers.utils.formatUnits(await contract.balanceOf(account), 18);

      setEthBalance(ethBal);
      setTokenBalance(tokenBal);
    } catch (err) {
      setStatus("Failed to fetch balances: " + err.message);
    }
  }

  async function checkOwner() {
    if (!contract || !account) return;
    try {
      setIsOwner((await contract.owner()).toLowerCase() === account.toLowerCase());
    } catch (error) {
      setStatus("Could not fetch owner: " + error.message);
    }
  }

  useEffect(() => {
    if (account && contract) {
      fetchBalance();
      checkOwner();
    }
  }, [account, contract]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      disconnectWallet();
      setStatus(accounts.length === 0 ? "No accounts found." : "Account changed. Please re-connect & sign again.");
    };

    const handleChainChanged = (chainId) => {
      disconnectWallet();
      setStatus(`Network changed. Please re-connect & sign again. (ChainID = ${chainId})`);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>MyToken DApp</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginBottom: "20px" }}>
        {!account ? (
          <ConnectWallet account={account} onClickConnect={connectWallet} />
        ) : (
          <button
            onClick={disconnectWallet}
            style={{
              padding: "10px 15px",
              background: "#ff4d4d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#cc0000")}
            onMouseOut={(e) => (e.target.style.background = "#ff4d4d")}
          >
            Disconnect Wallet
          </button>
        )}
      </div>

      {status && (
        <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "5px", maxWidth: "400px", margin: "auto", marginBottom: "15px" }}>
          {status}
        </div>
      )}

      {account && (
        <div style={{ marginTop: "1rem", fontSize: "18px" }}>
          <p><b>ETH Balance:</b> {ethBalance}</p>
          <p><b>Token Balance (MYT):</b> {tokenBalance}</p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
        {contract && <TransferForm contract={contract} fetchBalance={fetchBalance} setStatus={setStatus} />}
        {contract && isOwner && <MintForm contract={contract} account={account} fetchBalance={fetchBalance} setStatus={setStatus} />}
        {contract && <BurnForm contract={contract} fetchBalance={fetchBalance} setStatus={setStatus} />}
      </div>
    </div>
  );
}

export default App;

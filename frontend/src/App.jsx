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

      const signMsg = "Signing into MyToken DApp!";
      await _signer.signMessage(signMsg);
      setStatus("Wallet connected & signed in successfully.");
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
    <div className="p-6">
      <h1 className="text-2xl font-bold">MyToken DApp</h1>
      {!account ? <ConnectWallet account={account} onClickConnect={connectWallet} /> : <button className="mt-3 px-4 py-2 bg-red-500 text-white rounded" onClick={disconnectWallet}>Disconnect Wallet</button>}
      {status && <p className="mt-2 bg-gray-200 p-2 rounded">Status: {status}</p>}
      {account && (
        <div className="mt-4">
          <p><b>ETH Balance:</b> {ethBalance}</p>
          <p><b>Token Balance (MYT):</b> {tokenBalance}</p>
        </div>
      )}
      {contract && <TransferForm contract={contract} fetchBalance={fetchBalance} setStatus={setStatus} />}
      {contract && isOwner && <MintForm contract={contract} account={account} fetchBalance={fetchBalance} setStatus={setStatus} />}
      {contract && <BurnForm contract={contract} fetchBalance={fetchBalance} setStatus={setStatus} />}
    </div>
  );
}

export default App;

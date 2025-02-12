// src/App.jsx
import React, { useEffect, useState } from "react"
import { ethers } from "ethers"

// Import file artifact Hardhat
import MyTokenArtifact from "./abi/MyToken.json"

// Import komponen
import ConnectWallet from "./components/ConnectWallet"
import TransferForm from "./components/TransferForm"
import MintForm from "./components/MintForm"
import BurnForm from "./components/BurnForm"

// Alamat kontrak MyToken di Sepolia (hasil deploy)
const CONTRACT_ADDRESS = "0x89b6aFA21A15d80E545dFB64A54E28637CEb9505"

function App() {
  // State untuk menyimpan data penting
  const [provider, setProvider] = useState(null)  // Ethers provider
  const [signer, setSigner] = useState(null)      // Ethers signer
  const [account, setAccount] = useState("")      // Alamat wallet yang terkoneksi
  const [contract, setContract] = useState(null)  // Instance contract
  const [isOwner, setIsOwner] = useState(false)   // Flag apakah account adalah owner kontrak
  const [ethBalance, setEthBalance] = useState("0")    // Saldo ETH
  const [tokenBalance, setTokenBalance] = useState("0")// Saldo token
  const [status, setStatus] = useState("")             // Pesan status untuk UI

  /**
   * Fungsi connectWallet() memanggil Metamask agar user mengizinkan
   * akses ke account. Setelah berhasil, kita set provider, signer, dan account.
   * Lalu kita lakukan signMessage() sebagai bukti login user.
   */
  async function connectWallet() {
    // Pastikan Metamask tersedia
    if (!window.ethereum) {
      setStatus("Error: Metamask not detected. Please install Metamask.")
      return
    }

    try {
      // Buat provider baru dari window.ethereum (Ethers v5 style)
      const _provider = new ethers.providers.Web3Provider(window.ethereum)

      // Minta akses akun
      await _provider.send("eth_requestAccounts", [])

      // Dapatkan signer (akun yang terhubung)
      const _signer = _provider.getSigner()
      const _account = await _signer.getAddress()

      // Simpan ke state
      setProvider(_provider)
      setSigner(_signer)
      setAccount(_account)

      // Buat instance contract
      const _contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MyTokenArtifact.abi,  // panggil field .abi dari artifact
        _signer
      )
      setContract(_contract)

      // Lakukan sign message, agar user "login" resmi
      const signMsg = "Signing into MyToken DApp!"
      const signature = await _signer.signMessage(signMsg)
      console.log("User signature:", signature)

      setStatus("Wallet connected & signed in successfully.")
    } catch (err) {
      console.error(err)
      setStatus("Failed to connect wallet: " + err.message)
    }
  }

  /**
   * Fitur "logout" atau disconnectWallet.
   * Kita reset semua state terkait wallet/contract.
   */
  function disconnectWallet() {
    setProvider(null)
    setSigner(null)
    setAccount("")
    setContract(null)
    setIsOwner(false)
    setEthBalance("0")
    setTokenBalance("0")
    setStatus("Wallet disconnected.")
  }

  /**
   * fetchBalance() untuk mengambil saldo ETH & token
   * lalu disimpan ke state.
   */
  async function fetchBalance() {
    if (!provider || !account || !contract) return

    try {
      // Ambil saldo ETH
      const ethBalBN = await provider.getBalance(account)
      const ethBal = ethers.utils.formatEther(ethBalBN)

      // Ambil saldo token (ERC-20)
      const tokenBalBN = await contract.balanceOf(account)
      // Asumsi decimals = 18, maka kita format
      const tokenBal = ethers.utils.formatUnits(tokenBalBN, 18)

      setEthBalance(ethBal)
      setTokenBalance(tokenBal)
    } catch (err) {
      console.error(err)
      setStatus("Failed to fetch balances: " + err.message)
    }
  }

  /**
   * Cek apakah user yang terhubung adalah owner
   * (kontrak MyToken kita asumsikan mewarisi Ownable,
   *  jadi ada fungsi `owner()`).
   */
  async function checkOwner() {
    if (!contract || !account) return
    try {
      const _ownerAddress = await contract.owner()
      // Samakan (lowerCase) untuk aman
      setIsOwner(_ownerAddress.toLowerCase() === account.toLowerCase())
    } catch (error) {
      console.error(error)
      setStatus("Could not fetch owner: " + error.message)
    }
  }

  /**
   * Setiap kali "account" atau "contract" berubah,
   * kita coba refresh balance dan cek owner.
   */
  useEffect(() => {
    if (account && contract) {
      fetchBalance()
      checkOwner()
    }
  }, [account, contract])

  /**
   * Menangani event dari Metamask:
   * 1. accountsChanged => user ganti akun
   * 2. chainChanged => user ganti network
   *
   * Karena requirement: "tiap ganti akun/jaringan harus sign lagi"
   * Kita pakai strategi: disconnectWallet() => user harus connect ulang.
   */
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts) => {
      // Jika user switch account, kita langsung paksa logout
      // agar user harus connect + sign lagi
      if (accounts.length === 0) {
        // Tidak ada akun terhubung
        disconnectWallet()
        setStatus("No accounts found.")
      } else {
        // Ada account baru -> disconnect & suruh user connect ulang
        disconnectWallet()
        setStatus("Account changed. Please re-connect & sign again.")
      }
    }

    const handleChainChanged = (chainId) => {
      // Jika user ganti jaringan, kita pun disconnect
      // agar user connect & sign ulang
      disconnectWallet()
      setStatus("Network changed. Please re-connect & sign again. (ChainID = " + chainId + ")")
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [])

  return (
    <div style={{ padding: "1rem" }}>
      <h1>MyToken DApp</h1>

      {/* 
        Tombol Connect/Disconnect 
        - Jika belum connect => Tampilkan tombol Connect 
        - Jika sudah connect => Tampilkan Disconnect 
      */}
      {!account ? (
        <ConnectWallet account={account} onClickConnect={connectWallet} />
      ) : (
        <button onClick={disconnectWallet}>Disconnect Wallet</button>
      )}

      {/* Tampilkan status apa pun */}
      {status && (
        <p style={{ background: "#f0f0f0", padding: "0.5rem" }}>
          Status: {status}
        </p>
      )}

      {/* Jika sudah connect, tampilkan info saldo */}
      {account && (
        <div style={{ marginTop: "1rem" }}>
          <p>
            <b>ETH Balance:</b> {ethBalance}
          </p>
          <p>
            <b>Token Balance (MYT):</b> {tokenBalance}
          </p>
        </div>
      )}

      {/* Form transfer token, akan muncul jika contract sudah siap */}
      {contract && (
        <TransferForm
          contract={contract}
          fetchBalance={fetchBalance}
          setStatus={setStatus}
        />
      )}

      {/* Jika isOwner = true, tampilkan form Mint */}
      {contract && isOwner && (
        <MintForm
          contract={contract}
          account={account}
          fetchBalance={fetchBalance}
          setStatus={setStatus}
        />
      )}

      {/* Form burn token (siapa saja) */}
      {contract && (
        <BurnForm
          contract={contract}
          fetchBalance={fetchBalance}
          setStatus={setStatus}
        />
      )}
    </div>
  )
}

export default App

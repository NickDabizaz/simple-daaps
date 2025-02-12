// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev Contoh implementasi ERC-20 dengan fitur mint dan burn 
 *      menggunakan versi terbaru OpenZeppelin (v5.x).
 */
contract MyToken is ERC20, Ownable {
    // Event tambahan
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    /**
     * @dev Constructor:
     * - Memberikan nama dan simbol token pada ERC20.
     * - Mengatur alamat owner awal via Ownable(_initialOwner).
     *
     * @param _name           Nama token (contoh: "MyToken")
     * @param _symbol         Simbol token (contoh: "MYT")
     * @param _initialOwner   Alamat yang akan menjadi owner
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _initialOwner
    )
        ERC20(_name, _symbol)
        Ownable(_initialOwner) // ← Penting untuk versi 5.x
    {
        // (Opsional) Bisa langsung mint supply awal di sini:
        // _mint(_initialOwner, 1000 * 10 ** decimals());
    }

    /**
     * @dev Mint token baru ke alamat `to`. Hanya boleh dipanggil oleh owner.
     * @param to      Alamat tujuan mint
     * @param amount  Jumlah token yang akan di-mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn token dari saldo caller (msg.sender).
     * @param amount  Jumlah token yang akan di-burn
     */
    function burn(uint256 amount) external {
        _burn(_msgSender(), amount);
        emit TokensBurned(_msgSender(), amount);
    }

    /**
     * @dev Burn token dari alamat `account`. Hanya boleh dipanggil oleh owner.
     * @param account  Alamat yang tokennya akan di-burn
     * @param amount   Jumlah token yang akan di-burn
     */
    function burnFrom(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
        emit TokensBurned(account, amount);
    }
}

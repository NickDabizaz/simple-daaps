const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let MyToken, myToken;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy("MyToken", "MYT", owner.address);
    await myToken.waitForDeployment();
  });

  it("should have the correct name and symbol", async function () {
    expect(await myToken.name()).to.equal("MyToken");
    expect(await myToken.symbol()).to.equal("MYT");
  });

  it("owner can mint tokens", async function () {
    // Mint 1000 token ke addr1
    await myToken.connect(owner).mint(addr1.address, 1000);
    const balanceAddr1 = await myToken.balanceOf(addr1.address);
    expect(balanceAddr1).to.equal(1000);
  });

  it("non-owner should not be able to mint", async function () {
    // Perbaiki custom error sesuai Ownable v5
    await expect(
      myToken.connect(addr1).mint(addr2.address, 1000)
    ).to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount")
     .withArgs(addr1.address); // <-- opsional untuk cek address
  });

  it("should burn tokens from msg.sender", async function () {
    await myToken.connect(owner).mint(addr1.address, 1000);
    await myToken.connect(addr1).burn(500);
    const balanceAddr1 = await myToken.balanceOf(addr1.address);
    expect(balanceAddr1).to.equal(500);
  });

  it("owner can burn tokens from another account", async function () {
    await myToken.connect(owner).mint(addr1.address, 1000);
    await myToken.connect(owner).burnFrom(addr1.address, 200);
    const balanceAddr1 = await myToken.balanceOf(addr1.address);
    expect(balanceAddr1).to.equal(800);
  });
});

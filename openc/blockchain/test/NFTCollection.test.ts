import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFT Collection", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    const nftMarket = await NFTMarket.deploy();
    const marketAddress = await nftMarket.getAddress();

    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftCollection = await NFTCollection.deploy(marketAddress);

    return { nftCollection, owner, otherAccount, marketAddress };
  }

  it("Should mint a token", async function () {
    const { nftCollection } = await loadFixture(deployFixture);

    await nftCollection.mint("metadata uri");

    expect(await nftCollection.tokenURI(1)).to.equal("metadata uri");
  });

  it("Can change approval", async function () {
    const { nftCollection, otherAccount, owner } = await loadFixture(
      deployFixture
    );

    const instance = nftCollection.connect(otherAccount);
    await instance.mint("metadata uri");
    await instance.setApprovalForAll(await owner.getAddress(), false);

    expect(
      await nftCollection.isApprovedForAll(
        await otherAccount.getAddress(),
        await owner.getAddress()
      )
    ).to.equal(false);
  });

  it("Cannot change approval", async function () {
    const { nftCollection, otherAccount, marketAddress } = await loadFixture(
      deployFixture
    );

    const instance = nftCollection.connect(otherAccount);
    await instance.mint("metadata uri");
    await expect(
      instance.setApprovalForAll(marketAddress, false)
    ).to.be.revertedWith("Cannot remove marketplace approval");
  });
});

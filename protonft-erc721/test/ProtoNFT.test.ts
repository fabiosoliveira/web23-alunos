import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProtoNFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const ProtoNFT = await ethers.getContractFactory("ProtoNFT");
    const contract = await ProtoNFT.deploy();

    return { contract, owner, otherAccount };
  }

  it("Should ...", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    // expect(await lock.unlockTime()).to.equal(unlockTime);
  });
});

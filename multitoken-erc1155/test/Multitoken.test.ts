import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Multitoken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Multitoken = await ethers.getContractFactory("Multitoken");
    const contract = await Multitoken.deploy();

    return { contract, owner, otherAccount };
  }

  it("Should ...", async function () {
    // const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);
    // expect(await lock.unlockTime()).to.equal(unlockTime);
  });
});

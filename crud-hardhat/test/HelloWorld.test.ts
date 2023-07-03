import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("HelloWorld", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const HelloWorld = await ethers.getContractFactory("HelloWorld");
    const helloWorld = await HelloWorld.deploy();

    return { helloWorld, owner, otherAccount };
  }

  it("Should get Hello World", async function () {
    const { helloWorld, owner, otherAccount } = await loadFixture(
      deployFixture
    );

    expect(await helloWorld.message()).to.equal("Hello World!");
  });
});

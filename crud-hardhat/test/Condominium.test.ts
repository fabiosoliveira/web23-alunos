import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Condominium", function () {
  async function deployFixture() {
    const [manager, resident] = await ethers.getSigners();

    const Condominium = await ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();

    return { contract, manager, resident };
  }

  it("Should be residence", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    expect(await contract.residenceExists(2102)).to.equal(true);
  });

  it("Should be resident", async function () {
    const { contract, manager, resident } = await loadFixture(deployFixture);

    expect(await contract.isResident(resident.address)).to.equal(true);
  });
});

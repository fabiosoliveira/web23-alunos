import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CondominiumAdapter", function () {
  enum Options {
    EMPTY = 0,
    YES = 1,
    NO = 2,
    ABSTENTION = 3,
  }

  enum Status {
    IDLE = 0,
    VOTING = 1,
    APPROVED = 2,
    DENIED = 3,
  }

  async function deployAdapterFixture() {
    const [manager, ...accounts] = await ethers.getSigners();

    const CondominiumAdapter = await ethers.getContractFactory(
      "CondominiumAdapter"
    );
    const adapter = await CondominiumAdapter.deploy();

    return { adapter, manager, accounts };
  }

  async function deployImplementationFixture() {
    const Condominium = await ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();

    return { contract };
  }

  it("Should upgrade", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);
    const address = await adapter.getAddress();

    expect(address).to.equal(contract.address);
  });

  it("Should NOT upgrade (permission)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    const instance = adapter.connect(accounts[0]);

    await expect(instance.upgrade(contract.address)).to.be.rejectedWith(
      "You do not have permission"
    );
  });
});

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

  it("Should add resident", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addResident(accounts[0].address, 1301);

    expect(await contract.isResident(accounts[0].address)).to.equal(true);
  });

  it("Should remove resident", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addResident(accounts[0].address, 1301);
    await adapter.removeResident(accounts[0].address);

    expect(await contract.isResident(accounts[0].address)).to.equal(false);
  });

  it("Should set councelor", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addResident(accounts[0].address, 1301);
    await adapter.setCounselor(accounts[0].address, true);

    expect(await contract.counselors(accounts[0].address)).to.equal(true);
  });

  it("Should add topic", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addTopic("topic 1", "description 1");

    expect(await contract.topicExists("topic 1")).to.equal(true);
  });

  it("Should remove topic", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addTopic("topic 1", "description 1");
    await adapter.removeTopic("topic 1");

    expect(await contract.topicExists("topic 1")).to.equal(false);
  });

  it("Should open voting", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addTopic("topic 1", "description 1");
    await adapter.openVoting("topic 1");
    const topic = await contract.getTopic("topic 1");

    expect(topic.status).to.equal(Status.VOTING);
  });

  it("Should vote", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addResident(accounts[0].address, 1301);

    await adapter.addTopic("topic 1", "description 1");
    await adapter.openVoting("topic 1");

    const instance = adapter.connect(accounts[0]);
    await instance.vote("topic 1", Options.YES);

    expect(await contract.numberOfVotes("topic 1")).to.equal(1);
  });

  it("Should close voting", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addResident(accounts[0].address, 1301);

    await adapter.addTopic("topic 1", "description 1");
    await adapter.openVoting("topic 1");

    const instance = adapter.connect(accounts[0]);
    await instance.vote("topic 1", Options.YES);

    await adapter.closeVoting("topic 1");

    const topic = await contract.getTopic("topic 1");

    expect(topic.status).to.equal(Status.APPROVED);
  });
});

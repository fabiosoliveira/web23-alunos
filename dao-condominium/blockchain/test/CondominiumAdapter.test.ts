import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { CondominiumAdapter } from "../typechain-types";

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
    DELETED = 4,
    SPENT = 5,
  }

  enum Category {
    DECISION = 0,
    SPENT = 1,
    CHANGE_QUOTA = 2,
    CHANGE_MANAGER = 3,
  }

  async function addResidents(
    adapter: CondominiumAdapter,
    count: number,
    accounts: SignerWithAddress[]
  ) {
    const skip = count < 20 ? 0 : 1;
    for (let i = 1; i <= count; i++) {
      const residenceId =
        1000 * Math.ceil(i / 25) +
        100 * Math.ceil(i / 5) +
        (i - 5 * Math.floor((i - 1) / 5));
      await adapter.addResident(accounts[i - skip].address, residenceId); //1 101

      const instance = adapter.connect(accounts[i - skip]);
      await instance.payQuota(residenceId, {
        value: ethers.utils.parseEther("0.01"),
      });
    }
  }

  async function addVotes(
    adapter: CondominiumAdapter,
    count: number,
    accounts: SignerWithAddress[],
    deny: boolean = false
  ) {
    const skip = count < 20 ? 0 : 1;
    for (let i = 1; i <= count; i++) {
      const instance = adapter.connect(accounts[i - skip]);
      await instance.vote("topic 1", deny ? Options.NO : Options.YES);
    }
  }

  async function deployAdapterFixture() {
    const accounts = await ethers.getSigners();
    const manager = accounts[0];

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

  it("Should get manager", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);
    const managerAddress = await adapter.getManager();

    expect(managerAddress).to.equal(manager.address);
  });

  it("Should NOT get manager (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    await expect(adapter.getManager()).to.be.revertedWith(
      "You must upgrade first"
    );
  });

  it("Should get quota", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);
    const quota = await adapter.getQuota();

    expect(quota).to.equal(ethers.utils.parseEther("0.01"));
  });

  it("Should NOT get quota (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    await expect(adapter.getQuota()).to.be.revertedWith(
      "You must upgrade first"
    );
  });

  it("Should NOT upgrade (permission)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    const instance = adapter.connect(accounts[1]);

    await expect(instance.upgrade(contract.address)).to.be.revertedWith(
      "You do not have permission"
    );
  });

  it("Should NOT upgrade (address)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    await expect(
      adapter.upgrade("0x0000000000000000000000000000000000000000")
    ).to.be.revertedWith("Invalid address");
  });

  it("Should get residents", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addResident(accounts[1].address, 1301);

    const result = await adapter.getResidents(1, 10);

    expect(result.residents[0].wallet).to.equal(accounts[1].address);
  });

  it("Should NOT get residents (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    await expect(adapter.getResidents(1, 10)).to.be.revertedWith(
      "You must upgrade first"
    );
  });

  it("Should NOT get resident (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    await expect(adapter.getResident(accounts[0].address)).to.be.revertedWith(
      "You must upgrade first"
    );
  });

  it("Should add resident", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addResident(accounts[1].address, 1301);

    expect(await contract.isResident(accounts[1].address)).to.equal(true);
  });

  it("Should NOT add resident (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );

    await expect(
      adapter.addResident(accounts[1].address, 1301)
    ).to.be.revertedWith("You must upgrade first");
  });

  it("Should remove resident", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addResident(accounts[1].address, 1301);

    await adapter.removeResident(accounts[1].address);

    expect(await contract.isResident(accounts[1].address)).to.equal(false);
  });

  it("Should NOT remove resident (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );

    await expect(
      adapter.removeResident(accounts[1].address)
    ).to.be.revertedWith("You must upgrade first");
  });

  it("Should set counselor", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addResident(accounts[1].address, 1301);

    await adapter.setCounselor(accounts[1].address, true);

    const resident = await adapter.getResident(accounts[1].address);

    expect(resident.isCounselor).to.equal(true);
  });

  it("Should NOT set counselor (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );

    await expect(
      adapter.setCounselor(accounts[1].address, true)
    ).to.be.revertedWith("You must upgrade first");
  });

  it("Should get topic", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    const topic = await adapter.getTopic("topic 1");

    expect(topic.title).to.equal("topic 1");
  });

  it("Should NOT get topic (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );

    await expect(adapter.getTopic("topic 1")).to.be.revertedWith(
      "You must upgrade first"
    );
  });

  it("Should get topics", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    const result = await adapter.getTopics(1, 10);

    expect(result.topics[0].title).to.equal("topic 1");
  });

  it("Should get topics (empty)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    const result = await adapter.getTopics(1, 10);

    expect(result.topics.length).to.equal(10);
  });

  it("Should NOT get topics (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    await expect(adapter.getTopics(1, 10)).to.be.revertedWith(
      "You must upgrade first"
    );
  });

  it("Should add topic", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    expect(await contract.topicExists("topic 1")).to.equal(true);
  });

  it("Should NOT add topic (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );

    await expect(
      adapter.addTopic(
        "topic 1",
        "description 1",
        Category.DECISION,
        0,
        manager.address
      )
    ).to.be.revertedWith("You must upgrade first");
  });

  it("Should edit topic", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.SPENT,
      1,
      manager.address
    );

    await adapter.editTopic("topic 1", "new description", 2, manager.address);

    const topic = await contract.getTopic("topic 1");

    expect(topic.description === "new description").to.equal(true);
  });

  it("Should NOT edit topic (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );

    await expect(
      adapter.editTopic("topic 1", "new description", 2, manager.address)
    ).to.be.revertedWith("You must upgrade first");
  });

  it("Should remove topic", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    await adapter.removeTopic("topic 1");

    expect(await contract.topicExists("topic 1")).to.equal(false);
  });

  it("Should NOT remove topic (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );

    await expect(adapter.removeTopic("topic 1")).to.be.revertedWith(
      "You must upgrade first"
    );
  });

  it("Should open voting", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    await adapter.openVoting("topic 1");

    const topic = await contract.getTopic("topic 1");

    expect(topic.status).to.equal(Status.VOTING);
  });

  it("Should NOT open voting (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );

    await expect(adapter.openVoting("topic 1")).to.be.revertedWith(
      "You must upgrade first"
    );
  });

  it("Should get votes", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await addResidents(adapter, 2, accounts);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    await adapter.openVoting("topic 1");

    const instance = adapter.connect(accounts[1]);
    await instance.vote("topic 1", Options.YES);

    const votes = await adapter.getVotes("topic 1");

    expect(votes.length).to.equal(await contract.numberOfVotes("topic 1"));
  });

  it("Should NOT get votes (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await expect(adapter.getVotes("topic 1")).to.be.revertedWith(
      "You must upgrade first"
    );
  });

  it("Should vote", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await addResidents(adapter, 1, accounts);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    await adapter.openVoting("topic 1");

    const instance = adapter.connect(accounts[1]);
    await instance.vote("topic 1", Options.YES);

    expect(await contract.numberOfVotes("topic 1")).to.equal(1);
  });

  it("Should NOT vote (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );

    await expect(adapter.vote("topic 1", Options.YES)).to.be.revertedWith(
      "You must upgrade first"
    );
  });

  it("Should close voting (DECISION APPROVED)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await addResidents(adapter, 5, accounts);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    await adapter.openVoting("topic 1");

    await addVotes(adapter, 5, accounts);

    await expect(adapter.closeVoting("topic 1")).to.emit(
      adapter,
      "TopicChanged"
    );
    const topic = await contract.getTopic("topic 1");
    expect(topic.status).to.equal(Status.APPROVED);
  });

  it("Should close voting (DECISION DENIED)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await addResidents(adapter, 5, accounts);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    await adapter.openVoting("topic 1");

    await addVotes(adapter, 5, accounts, true);

    await expect(adapter.closeVoting("topic 1")).to.emit(
      adapter,
      "TopicChanged"
    );
    const topic = await contract.getTopic("topic 1");
    expect(topic.status).to.equal(Status.DENIED);
  });

  it("Should close voting (CHANGE_MANAGER, resident)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await addResidents(adapter, 15, accounts);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.CHANGE_MANAGER,
      0,
      accounts[1].address
    );

    await adapter.openVoting("topic 1");

    await addVotes(adapter, 15, accounts);

    await expect(adapter.closeVoting("topic 1"))
      .to.emit(adapter, "ManagerChanged")
      .withArgs(accounts[1].address);
  });

  it("Should close voting (CHANGE_MANAGER, external)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await addResidents(adapter, 15, accounts);

    const externalManager = "0xB88940367accc8c0CE4739b7069B5C63D08Ee965";
    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.CHANGE_MANAGER,
      0,
      externalManager
    );

    await adapter.openVoting("topic 1");

    await addVotes(adapter, 15, accounts);

    await expect(adapter.closeVoting("topic 1"))
      .to.emit(adapter, "ManagerChanged")
      .withArgs(externalManager);
  });

  it("Should close voting (CHANGE_QUOTA)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await addResidents(adapter, 20, accounts);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.CHANGE_QUOTA,
      100,
      manager.address
    );

    await adapter.openVoting("topic 1");

    await addVotes(adapter, 20, accounts);

    await expect(adapter.closeVoting("topic 1"))
      .to.emit(adapter, "QuotaChanged")
      .withArgs(100);
  });

  it("Should NOT close voting (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    await expect(adapter.closeVoting("topic 1")).to.be.revertedWith(
      "You must upgrade first"
    );
  });

  it("Should NOT pay quota (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    await expect(
      adapter.payQuota(1102, { value: ethers.utils.parseEther("0.01") })
    ).to.be.revertedWith("You must upgrade first");
  });

  it("Should transfer", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    const { contract } = await loadFixture(deployImplementationFixture);

    await adapter.upgrade(contract.address);

    await addResidents(adapter, 10, accounts);

    await adapter.addTopic(
      "topic 1",
      "description 1",
      Category.SPENT,
      100,
      accounts[1].address
    );

    await adapter.openVoting("topic 1");

    await addVotes(adapter, 10, accounts);

    await adapter.closeVoting("topic 1");

    const balanceBefore = await adapter.provider.getBalance(contract.address);
    const balanceWorkerBefore = await adapter.provider.getBalance(
      accounts[1].address
    );
    await adapter.transfer("topic 1", 100);

    const balanceAfter = await adapter.provider.getBalance(contract.address);
    const balanceWorkerAfter = await adapter.provider.getBalance(
      accounts[1].address
    );
    const topic = await contract.getTopic("topic 1");

    expect(balanceAfter).to.equal(balanceBefore.sub(100));
    expect(balanceWorkerAfter).to.equal(balanceWorkerBefore.add(100));
    expect(topic.status).to.equal(Status.SPENT);
  });

  it("Should NOT transfer (upgrade)", async function () {
    const { adapter, manager, accounts } = await loadFixture(
      deployAdapterFixture
    );
    await expect(adapter.transfer("topic 1", 100)).to.be.revertedWith(
      "You must upgrade first"
    );
  });
});

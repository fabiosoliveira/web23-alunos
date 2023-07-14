import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Condominium } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Condominium", function () {
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
    SPENT = 4,
  }

  enum Category {
    DECISION = 0,
    SPENT = 1,
    CHANGE_QUOTA = 2,
    CHANGE_MANAGER = 3,
  }

  async function addResidents(
    contract: Condominium,
    count: number,
    accounts: SignerWithAddress[]
  ) {
    for (let i = 1; i <= count; i++) {
      const residenceId =
        1000 * Math.ceil(i / 25) +
        100 * Math.ceil(i / 5) +
        (i - 5 * Math.floor((i - 1) / 5));
      await contract.addResident(accounts[i - 1].address, residenceId); //1 101

      const instance = contract.connect(accounts[i - 1]);
      await instance.payQuota(residenceId, {
        value: ethers.utils.parseEther("0.01"),
      });
    }
  }

  async function addVotes(
    contract: Condominium,
    count: number,
    accounts: SignerWithAddress[],
    shouldApprove: boolean = true
  ) {
    for (let i = 1; i <= count; i++) {
      const instance = contract.connect(accounts[i - 1]);
      await instance.vote("topic 1", shouldApprove ? Options.YES : Options.NO);
    }
  }

  async function deployFixture() {
    const accounts = await ethers.getSigners();
    const manager = accounts[0];

    const Condominium = await ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();

    return { contract, manager, accounts };
  }

  it("Should be residence", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);
    expect(await contract.residenceExists(2102)).to.equal(true);
  });

  it("Should add resident", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    expect(await contract.isResident(accounts[1].address)).to.equal(true);
  });

  it("Should NOT add resident (address)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(
      contract.addResident("0x0000000000000000000000000000000000000000", 2102)
    ).to.be.revertedWith("Invalid address");
  });

  it("Should NOT add resident (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    const instance = contract.connect(accounts[1]);
    await expect(
      instance.addResident(accounts[1].address, 2102)
    ).to.be.revertedWith("Only the manager or the council can do this");
  });

  it("Should NOT add resident (residence)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(
      contract.addResident(accounts[1].address, 21020)
    ).to.be.revertedWith("This residence does not exists");
  });

  it("Should remove resident (latest)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.removeResident(accounts[1].address);

    expect(await contract.isResident(accounts[1].address)).to.equal(false);
  });

  it("Should remove resident (first)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.addResident(accounts[2].address, 2103);

    await contract.setCounselor(accounts[2].address, true);

    await contract.removeResident(accounts[1].address);

    expect(await contract.isResident(accounts[1].address)).to.equal(false);
  });

  it("Should NOT remove resident (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    const instance = contract.connect(accounts[1]);
    await expect(
      instance.removeResident(accounts[1].address)
    ).to.be.revertedWith("Only the manager can do this");
  });

  it("Should NOT remove resident (counselor)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.setCounselor(accounts[1].address, true);

    await expect(
      contract.removeResident(accounts[1].address)
    ).to.be.revertedWith("A counselor cannot be removed");
  });

  it("Should add counselor", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.setCounselor(accounts[1].address, true);

    const instance = contract.connect(accounts[1]);
    await instance.addResident(accounts[2].address, 1302);

    const resident = await contract.getResident(accounts[1].address);

    expect(resident.isCounselor).to.equal(true);
    expect(await contract.isResident(accounts[2].address)).to.equal(true);
  });

  it("Should remove counselor (latest)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.setCounselor(accounts[1].address, true);

    await contract.setCounselor(accounts[1].address, false);

    const resident = await contract.getResident(accounts[1].address);

    expect(resident.isCounselor).to.equal(false);
  });

  it("Should remove counselor (first)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.addResident(accounts[2].address, 2103);

    await contract.setCounselor(accounts[1].address, true);

    await contract.setCounselor(accounts[2].address, true);

    await contract.setCounselor(accounts[1].address, false);

    const resident = await contract.getResident(accounts[1].address);

    expect(resident.isCounselor).to.equal(false);
  });

  it("Should NOT remove counselor (address)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(
      contract.setCounselor("0x0000000000000000000000000000000000000000", false)
    ).to.be.revertedWith("Invalid address");
  });

  it("Should NOT remove counselor (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.setCounselor(accounts[1].address, true);

    const instance = contract.connect(accounts[1]);
    await expect(
      instance.setCounselor(accounts[1].address, false)
    ).to.be.revertedWith("Only the manager can do this");
  });

  it("Should NOT remove counselor (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(
      contract.setCounselor(accounts[1].address, false)
    ).to.be.revertedWith("Counselor not found");
  });

  it("Should NOT add counselor (address)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(
      contract.setCounselor("0x0000000000000000000000000000000000000000", true)
    ).to.be.revertedWith("Invalid address");
  });

  it("Should NOT add counselor (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    const instance = contract.connect(accounts[1]);
    await expect(
      instance.setCounselor(accounts[1].address, true)
    ).to.be.revertedWith("Only the manager can do this");
  });

  it("Should NOT add counselor (resident)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(
      contract.setCounselor(accounts[1].address, true)
    ).to.be.revertedWith("The counselor must be a resident");
  });

  it("Should NOT add counselor (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.setCounselor(accounts[1].address, true);

    await expect(
      contract.setCounselor(accounts[2].address, false)
    ).to.be.revertedWith("Counselor not found");
  });

  it("Should change manager", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await addResidents(contract, 15, accounts);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.CHANGE_MANAGER,
      0,
      accounts[1].address
    );
    await contract.openVoting("topic 1");

    await addVotes(contract, 15, accounts);

    await contract.closeVoting("topic 1");

    expect(await contract.manager()).to.equal(accounts[1].address);
  });

  it("Should change quota", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await addResidents(contract, 20, accounts);
    const value = ethers.utils.parseEther("0.02");
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.CHANGE_QUOTA,
      value,
      manager.address
    );
    await contract.openVoting("topic 1");

    await addVotes(contract, 20, accounts);

    await contract.closeVoting("topic 1");

    expect(await contract.monthlyQuota()).to.equal(value);
  });

  it("Should edit topic", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.SPENT,
      1,
      manager.address
    );

    await contract.editTopic("topic 1", "new description", 2, manager.address);

    const topic = await contract.getTopic("topic 1");

    expect(topic.description).to.equal("new description");
  });

  it("Should edit topic (nothing)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.SPENT,
      1,
      manager.address
    );

    await contract.editTopic(
      "topic 1",
      "",
      0,
      "0x0000000000000000000000000000000000000000"
    );

    const topic = await contract.getTopic("topic 1");

    expect(topic.description).to.equal("description 1");
  });

  it("Should NOT edit topic (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.SPENT,
      1,
      manager.address
    );

    const instance = contract.connect(accounts[1]);
    await expect(
      instance.editTopic("topic 1", "new description", 2, manager.address)
    ).to.be.revertedWith("Only the manager can do this");
  });

  it("Should NOT edit topic (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.SPENT,
      1,
      manager.address
    );

    await expect(
      contract.editTopic("topic 2", "new description", 2, manager.address)
    ).to.be.revertedWith("The topic does not exists");
  });

  it("Should NOT edit topic (status)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.SPENT,
      1,
      manager.address
    );

    await contract.openVoting("topic 1");

    await expect(
      contract.editTopic("topic 1", "new description", 2, manager.address)
    ).to.be.revertedWith("Only IDLE topics can be edited");
  });

  it("Should get topic", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.addTopic(
      "topic 2",
      "description 2",
      Category.DECISION,
      0,
      manager.address
    );

    const topic = await contract.getTopic("topic 2");

    expect(topic.title).to.equal("topic 2");
  });

  it("Should add topic (manager)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    expect(await contract.topicExists("topic 1")).to.equal(true);
  });

  it("Should NOT add topic (amount)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(
      contract.addTopic(
        "topic 1",
        "description 1",
        Category.DECISION,
        10,
        manager.address
      )
    ).to.be.revertedWith("Wrong category");
  });

  it("Should add topic (resident)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    const instance = contract.connect(accounts[1]);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    expect(await contract.topicExists("topic 1")).to.equal(true);
  });

  it("Should NOT add topic (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    const instance = contract.connect(accounts[1]);
    await expect(
      instance.addTopic(
        "topic 1",
        "description 1",
        Category.DECISION,
        0,
        manager.address
      )
    ).to.be.revertedWith("Only the manager or the residents can do this");
  });

  it("Should NOT add topic (duplicated)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await expect(
      contract.addTopic(
        "topic 1",
        "description 1",
        Category.DECISION,
        0,
        manager.address
      )
    ).to.be.revertedWith("This topic already exists");
  });

  it("Should remove topic (latest)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.removeTopic("topic 1");

    expect(await contract.topicExists("topic 1")).to.equal(false);
  });

  it("Should remove topic (first)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.addTopic(
      "topic 2",
      "description 2",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.removeTopic("topic 1");

    expect(await contract.topicExists("topic 1")).to.equal(false);
  });

  it("Should NOT remove topic (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    const intance = contract.connect(accounts[1]);

    await expect(intance.removeTopic("topic 1")).to.be.revertedWith(
      "Only the manager can do this"
    );
  });

  it("Should NOT remove topic (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(contract.removeTopic("topic 1")).to.be.revertedWith(
      "The topic does not exists"
    );
  });

  it("Should NOT remove topic (status)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    await contract.openVoting("topic 1");

    await expect(contract.removeTopic("topic 1")).to.be.revertedWith(
      "Only IDLE topics can be removed"
    );
  });

  it("Should vote", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await addResidents(contract, 1, [accounts[1]]);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.openVoting("topic 1");

    const instance = contract.connect(accounts[1]);
    await instance.vote("topic 1", Options.ABSTENTION);

    expect(await instance.numberOfVotes("topic 1")).to.equal(1);
  });

  it("Should NOT vote (duplicated)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await addResidents(contract, 1, [accounts[1]]);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.openVoting("topic 1");

    const instance = contract.connect(accounts[1]);
    await instance.vote("topic 1", Options.YES);

    await expect(instance.vote("topic 1", Options.YES)).to.be.revertedWith(
      "A residence should vote only once"
    );
  });

  it("Should NOT vote (defaulter)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.openVoting("topic 1");

    const instance = contract.connect(accounts[1]);
    await expect(instance.vote("topic 1", Options.YES)).to.be.revertedWith(
      "The resident must be defaulter"
    );
  });

  it("Should NOT vote (status)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await addResidents(contract, 1, [accounts[1]]);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    const instance = contract.connect(accounts[1]);

    await expect(instance.vote("topic 1", Options.YES)).to.be.revertedWith(
      "Only VOTING topics can be voted"
    );
  });

  it("Should NOT vote (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await addResidents(contract, 1, [accounts[1]]);
    const instance = contract.connect(accounts[1]);

    await expect(instance.vote("topic 1", Options.YES)).to.be.revertedWith(
      "The topic does not exists"
    );
  });

  it("Should NOT vote (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.openVoting("topic 1");

    const instance = contract.connect(accounts[1]);

    await expect(instance.vote("topic 1", Options.YES)).to.be.revertedWith(
      "Only the manager or the residents can do this"
    );
  });

  it("Should NOT vote (empty)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await addResidents(contract, 1, [accounts[1]]);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.openVoting("topic 1");

    const instance = contract.connect(accounts[1]);

    await expect(instance.vote("topic 1", Options.EMPTY)).to.be.revertedWith(
      "The option cannot be EMPTY"
    );
  });

  it("Should close voting", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await addResidents(contract, 6, accounts);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.openVoting("topic 1");

    await addVotes(contract, 5, accounts, false);

    //vota abstenção
    const instance = contract.connect(accounts[5]);
    await instance.vote("topic 1", Options.ABSTENTION);

    await contract.closeVoting("topic 1");
    const topic = await contract.getTopic("topic 1");

    expect(topic.status).to.equal(Status.DENIED);
  });

  it("Should NOT close voting (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.openVoting("topic 1");

    const instance = contract.connect(accounts[1]);
    await expect(instance.closeVoting("topic 1")).to.be.revertedWith(
      "Only the manager can do this"
    );
  });

  it("Should NOT close voting (minimum votes)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.openVoting("topic 1");

    await expect(contract.closeVoting("topic 1")).to.be.revertedWith(
      "You cannot finish a voting without the minimum votes"
    );
  });

  it("Should NOT close voting (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);
    await expect(contract.closeVoting("topic 1")).to.be.revertedWith(
      "The topic does not exists"
    );
  });

  it("Should NOT close voting (status)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await expect(contract.closeVoting("topic 1")).to.be.revertedWith(
      "Only VOTING topics can be closed"
    );
  });

  it("Should NOT open voting (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    const instance = contract.connect(accounts[1]);
    await expect(instance.openVoting("topic 1")).to.be.revertedWith(
      "Only the manager can do this"
    );
  });

  it("Should NOT open voting (status)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    await contract.openVoting("topic 1");

    await expect(contract.openVoting("topic 1")).to.be.revertedWith(
      "Only IDLE topics can be open for voting"
    );
  });

  it("Should NOT open voting (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);
    await expect(contract.openVoting("topic 1")).to.be.revertedWith(
      "The topic does not exists"
    );
  });

  it("Should NOT pay quota (residence)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);
    await expect(
      contract.payQuota(1, { value: ethers.utils.parseEther("0.01") })
    ).to.be.revertedWith("The residence does not exists");
  });

  it("Should NOT pay quota (value)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);
    await expect(
      contract.payQuota(1102, { value: ethers.utils.parseEther("0.001") })
    ).to.be.revertedWith("Wrong value");
  });

  it("Should NOT pay quota (duplicated)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);
    await contract.payQuota(1102, { value: ethers.utils.parseEther("0.01") });
    await expect(
      contract.payQuota(1102, { value: ethers.utils.parseEther("0.01") })
    ).to.be.revertedWith("You cannot pay twice a month");
  });

  it("Should NOT transfer (manager)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    const instance = contract.connect(accounts[1]);
    await expect(instance.transfer("topic 1", 100)).to.be.revertedWith(
      "Only the manager can do this"
    );
  });

  it("Should NOT transfer (funds)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(contract.transfer("topic 1", 100)).to.be.revertedWith(
      "Insufficient funds"
    );
  });

  it("Should NOT transfer (topic)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await addResidents(contract, 1, accounts);

    await expect(contract.transfer("topic 1", 100)).to.be.revertedWith(
      "Only APPROVED SPENT topics can be used for transfers"
    );
  });

  it("Should NOT transfer (amount)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await addResidents(contract, 10, accounts);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.SPENT,
      100,
      accounts[1].address
    );

    await contract.openVoting("topic 1");

    await addVotes(contract, 10, accounts);

    await contract.closeVoting("topic 1");

    await expect(contract.transfer("topic 1", 101)).to.be.revertedWith(
      "The amount must be less or equal the APPROVED topic"
    );
  });

  it("Should pay quota", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    const instance = contract.connect(accounts[1]);
    await instance.payQuota(2102, { value: ethers.utils.parseEther("0.01") });

    const resident = await contract.getResident(accounts[1].address);

    //pay again, 31 days after
    await time.setNextBlockTimestamp(
      parseInt(`${Date.now() / 1000 + 31 * 24 * 60 * 60}`)
    );

    await instance.payQuota(2102, { value: ethers.utils.parseEther("0.01") });
    const residentAfter = await contract.getResident(accounts[1].address);

    expect(residentAfter.nextPayment).to.equal(
      resident.nextPayment.add(30 * 24 * 60 * 60)
    );
  });
});

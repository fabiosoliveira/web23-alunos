import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Condominium } from "../typechain-types";

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
    const skip = count < 20 ? 0 : 1;
    for (let i = 1; i <= count; i++) {
      const residenceId =
        1000 * Math.ceil(i / 25) +
        100 * Math.ceil(i / 5) +
        (i - 5 * Math.floor((i - 1) / 5));
      await contract.addResident(accounts[i - skip].address, residenceId); //1 101

      // const instance = contract.connect(accounts[i - skip]);
      // await instance.payQuota(residenceId, { value: ethers.utils.parseEther("0.01") });
    }
  }

  async function addVotes(
    contract: Condominium,
    count: number,
    accounts: SignerWithAddress[],
    deny: boolean = false
  ) {
    const skip = count < 20 ? 0 : 1;
    for (let i = 1; i <= count; i++) {
      const instance = contract.connect(accounts[i - skip]);
      await instance.vote("topic 1", deny ? Options.NO : Options.YES);
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
    ).to.be.revertedWith("This residence does not exist");
  });

  it("Should remove resident", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);
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

  it("Should NOT remove resident (councelor)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.setCounselor(accounts[1].address, true);

    await expect(
      contract.removeResident(accounts[1].address)
    ).to.be.revertedWith("A counselor cannot be removed");
  });

  it("Should set counselor", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.setCounselor(accounts[1].address, true);

    expect(await contract.counselors(accounts[1].address)).to.equal(true);
  });

  it("Should NOT set counselor (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    const instance = contract.connect(accounts[1]);
    await expect(
      instance.setCounselor(accounts[1].address, true)
    ).to.be.revertedWith("Only the manager can do this");
  });

  it("Should NOT set counselor (accounts[1])", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(
      contract.setCounselor(accounts[1].address, true)
    ).to.be.revertedWith("This counselor must be a resident");
  });

  // it("Should set manager", async function () {
  //   const { contract, manager, accounts } = await loadFixture(deployFixture);

  //   await contract.setManager(accounts[1].address);

  //   expect(await contract.manager()).to.equal(accounts[1].address);
  // });

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

  it("Should add topic (accounts[1])", async function () {
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

  it("Should NOT add topic (duplicated)", async function () {
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

  it("Should NOT add topic (permission)", async function () {
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

  it("Should remove topic", async function () {
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

  it("Should NOT remove topic (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );

    const instance = contract.connect(accounts[1]);

    expect(instance.removeTopic("topic 1")).to.be.revertedWith(
      "Only the manager can do this"
    );
  });

  it("Should NOT remove topic (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(contract.removeTopic("topic 1")).to.be.revertedWith(
      "This topic does not exist"
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
    await instance.vote("topic 1", Options.YES);

    expect(await instance.numberOfVotes("topic 1")).to.equal(1);
  });

  it("Should NOT vote (duplicated)", async function () {
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
    await instance.vote("topic 1", Options.YES);

    await expect(instance.vote("topic 1", Options.YES)).to.be.revertedWith(
      "A residence should vote only once"
    );
  });

  it("Should NOT vote (status)", async function () {
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

    await expect(instance.vote("topic 1", Options.YES)).to.be.revertedWith(
      "Only VOTING topics can be voted"
    );
  });

  it("Should NOT vote (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);
    const instance = contract.connect(accounts[1]);

    await expect(instance.vote("topic 1", Options.YES)).to.be.revertedWith(
      "This topic does not exist"
    );
  });

  it("Should NOT vote (premission)", async function () {
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

    await expect(instance.vote("topic 1", Options.EMPTY)).to.be.revertedWith(
      "The option cannot be EMPTY"
    );
  });

  it("Should close voting", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await addResidents(contract, 5, accounts);
    await contract.addTopic(
      "topic 1",
      "description 1",
      Category.DECISION,
      0,
      manager.address
    );
    await contract.openVoting("topic 1");

    await addVotes(contract, 5, accounts);

    await contract.closeVoting("topic 1");
    const topic = await contract.getTopic("topic 1");

    expect(topic.status).to.equal(Status.APPROVED);
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

  it("Should NOT close voting (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(contract.closeVoting("topic 1")).to.be.revertedWith(
      "This topic does not exist"
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
});

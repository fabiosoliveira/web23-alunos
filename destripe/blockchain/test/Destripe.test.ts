import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Destripe", function () {
  async function deployFixture() {
    const DestripeCoin = await ethers.getContractFactory("DestripeCoin");
    const destripeCoin = await DestripeCoin.deploy();

    await destripeCoin.waitForDeployment();

    const DestripeCollection = await ethers.getContractFactory(
      "DestripeCollection"
    );
    const destripeCollection = await DestripeCollection.deploy();

    await destripeCollection.waitForDeployment();
    const collectionAddress = await destripeCollection.getAddress();

    const Destripe = await ethers.getContractFactory("Destripe");
    const coinAddress = await destripeCoin.getAddress();
    const destripe = await Destripe.deploy(coinAddress, collectionAddress);

    await destripe.waitForDeployment();
    const destripeAddress = await destripe.getAddress();

    await destripeCollection.setAuthorizedContract(destripeAddress);

    const [owner, otherAccount] = await ethers.getSigners();

    await destripeCoin.mint(otherAccount.address, ethers.parseEther("1"));

    return {
      destripe,
      destripeAddress,
      destripeCoin,
      coinAddress,
      destripeCollection,
      collectionAddress,
      owner,
      otherAccount,
    };
  }

  it("Should do first payment", async function () {
    const { destripe, destripeAddress, destripeCoin, otherAccount } =
      await loadFixture(deployFixture);

    const instance = destripeCoin.connect(otherAccount);
    await instance.approve(destripeAddress, ethers.parseEther("0.01"));

    await expect(destripe.pay(otherAccount.address)).to.emit(
      destripe,
      "Granted"
    );
  });

  it("Should NOT do first payment", async function () {
    const { destripe, otherAccount } = await loadFixture(deployFixture);

    await expect(destripe.pay(otherAccount.address)).to.be.revertedWith(
      "Insufficient balance and/or allowance."
    );
  });

  it("Should do second payment", async function () {
    const { destripe, destripeAddress, destripeCoin, otherAccount } =
      await loadFixture(deployFixture);

    const instance = destripeCoin.connect(otherAccount);
    await instance.approve(destripeAddress, ethers.parseEther("0.01"));

    await destripe.pay(otherAccount.address);

    await time.increase(31 * 24 * 60 * 60);

    await expect(destripe.pay(otherAccount.address)).to.emit(destripe, "Paid");
  });

  it("Should NOT do second payment", async function () {
    const { destripe, destripeAddress, destripeCoin, otherAccount } =
      await loadFixture(deployFixture);

    const instance = destripeCoin.connect(otherAccount);
    await instance.approve(destripeAddress, ethers.parseEther("0.01"));

    await destripe.pay(otherAccount.address);

    await time.increase(31 * 24 * 60 * 60);

    await instance.approve(destripeAddress, ethers.parseEther("0.00001"));

    await expect(destripe.pay(otherAccount.address)).to.emit(
      destripe,
      "Revoked"
    );
  });

  it("Should do second payment after revoke", async function () {
    const { destripe, destripeAddress, destripeCoin, otherAccount } =
      await loadFixture(deployFixture);

    const instance = destripeCoin.connect(otherAccount);
    await instance.approve(destripeAddress, ethers.parseEther("0.01"));

    await destripe.pay(otherAccount.address);

    await time.increase(31 * 24 * 60 * 60);

    await instance.approve(destripeAddress, ethers.parseEther("0.00001"));

    await expect(destripe.pay(otherAccount.address)).to.emit(
      destripe,
      "Revoked"
    );

    await instance.approve(destripeAddress, ethers.parseEther("1"));
    await expect(destripe.pay(otherAccount.address)).to.emit(
      destripe,
      "Granted"
    );
  });
});

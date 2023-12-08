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

  it("Should mint", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });

    const balance = await contract.balanceOf(owner.address, 0);
    const supply = await contract.currentSupply(0);

    expect(balance).to.equal(1, "Cannot mint");
    expect(supply).to.equal(49, "Cannot mint");
  });

  it("Should NOT mint (exists)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(
      contract.mint(3, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWith("This token does not exist");
  });

  it("Should NOT mint (payment)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(
      contract.mint(0, { value: ethers.parseEther("0.001") })
    ).to.be.revertedWith("Insufficient payment");
  });

  it("Should NOT mint (supply)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    for (let i = 0; i < 50; i++) {
      await contract.mint(0, { value: ethers.parseEther("0.01") });
    }

    await expect(
      contract.mint(0, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWith("Max supply reached");
  });

  it("Should burn", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });
    await contract.burn(owner.address, 0, 1);

    const balance = await contract.balanceOf(owner.address, 0);
    const supply = await contract.currentSupply(0);

    expect(balance).to.equal(0, "Cannot burn");
    expect(supply).to.equal(49, "Cannot burn");
  });

  it("Should burn (approved)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });

    await contract.setApprovalForAll(otherAccount.address, true);
    const approved = await contract.isApprovedForAll(
      owner.address,
      otherAccount.address
    );

    const instance = contract.connect(otherAccount);
    await instance.burn(owner.address, 0, 1);

    const balance = await contract.balanceOf(owner.address, 0);
    const supply = await contract.currentSupply(0);

    expect(balance).to.equal(0, "Cannot burn (approved)");
    expect(supply).to.equal(49, "Cannot burn (approved)");
    expect(approved).to.equal(true, "Cannot burn (approved)");
  });

  it("Should NOT burn (balance)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(
      contract.burn(owner.address, 0, 1)
    ).to.be.revertedWithCustomError(contract, "ERC1155InsufficientBalance");
  });

  it("Should NOT burn (permission)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });

    const instance = contract.connect(otherAccount);

    await expect(
      instance.burn(owner.address, 0, 1)
    ).to.be.revertedWithCustomError(contract, "ERC1155MissingApprovalForAll");
  });

  it("Should safeTransferFrom", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });

    await contract.safeTransferFrom(
      owner.address,
      otherAccount.address,
      0,
      1,
      "0x00000000"
    );

    const balances = await contract.balanceOfBatch(
      [owner.address, otherAccount.address],
      [0, 0]
    );
    const supply = await contract.currentSupply(0);

    expect(balances[0]).to.equal(0, "Cannot safe transfer");
    expect(balances[1]).to.equal(1, "Cannot safe transfer");
    expect(supply).to.equal(49, "Cannot safe transfer");
  });

  it("Should emit transfer event", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });

    await expect(
      contract.safeTransferFrom(
        owner.address,
        otherAccount.address,
        0,
        1,
        "0x00000000"
      )
    )
      .to.emit(contract, "TransferSingle")
      .withArgs(owner.address, owner.address, otherAccount.address, 0, 1);
  });

  it("Should NOT safeTransferFrom (balance)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(
      contract.safeTransferFrom(
        owner.address,
        otherAccount.address,
        0,
        1,
        "0x00000000"
      )
    ).to.be.revertedWithCustomError(contract, "ERC1155InsufficientBalance");
  });

  it("Should NOT safeTransferFrom (exists)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(
      contract.safeTransferFrom(
        owner.address,
        otherAccount.address,
        10,
        1,
        "0x00000000"
      )
    ).to.be.revertedWithCustomError(contract, "ERC1155InsufficientBalance");
  });

  it("Should NOT safeTransferFrom (permission)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });

    const instance = contract.connect(otherAccount);

    await expect(
      instance.safeTransferFrom(
        owner.address,
        otherAccount.address,
        0,
        1,
        "0x00000000"
      )
    ).to.be.revertedWithCustomError(contract, "ERC1155MissingApprovalForAll");
  });

  it("Should NOT safeBatchTransferFrom (array mismatch)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });
    await contract.mint(1, { value: ethers.parseEther("0.01") });

    await expect(
      contract.safeBatchTransferFrom(
        owner.address,
        otherAccount.address,
        [0, 1],
        [1],
        "0x00000000"
      )
    ).to.be.revertedWithCustomError(contract, "ERC1155InvalidArrayLength");
  });

  it("Should NOT safeBatchTransferFrom (permission)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });
    await contract.mint(1, { value: ethers.parseEther("0.01") });

    const instance = contract.connect(otherAccount);

    await expect(
      instance.safeBatchTransferFrom(
        owner.address,
        otherAccount.address,
        [0, 1],
        [1, 1],
        "0x00000000"
      )
    ).to.be.revertedWithCustomError(contract, "ERC1155MissingApprovalForAll");
  });
});

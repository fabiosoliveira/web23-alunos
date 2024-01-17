import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Multitoken } from "../typechain-types";

describe("Multitoken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const _Multitoken = await ethers.getContractFactory("Multitoken");
    const contract = await upgrades.deployProxy(_Multitoken);
    const contractAddress = await contract.getAddress();

    return { contract, contractAddress, owner, otherAccount };
  }

  it("Should mint", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });

    const balance = await contract.balanceOf(owner.address, 0);

    expect(balance).to.equal(1, "Cannot mint");
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

    expect(balance).to.equal(0, "Cannot burn");
  });

  it("Should burn (approved)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });

    await contract.setApprovalForAll(otherAccount.address, true);
    const approved = await contract.isApprovedForAll(
      owner.address,
      otherAccount.address
    );

    const instance = contract.connect(otherAccount) as Multitoken;
    await instance.burn(owner.address, 0, 1);

    const balance = await contract.balanceOf(owner.address, 0);

    expect(balance).to.equal(0, "Cannot burn (approved)");
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

    const instance = contract.connect(otherAccount) as Multitoken;

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

    expect(balances[0]).to.equal(0, "Cannot safe transfer");
    expect(balances[1]).to.equal(1, "Cannot safe transfer");
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

    const instance = contract.connect(otherAccount) as Multitoken;

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

  it("Should safeBatchTransferFrom", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });
    await contract.mint(1, { value: ethers.parseEther("0.01") });

    await contract.safeBatchTransferFrom(
      owner.address,
      otherAccount.address,
      [0, 1],
      [1, 1],
      "0x00000000"
    );

    const balances = await contract.balanceOfBatch(
      [
        owner.address,
        owner.address,
        otherAccount.address,
        otherAccount.address,
      ],
      [0, 1, 0, 1]
    );

    expect(balances[0]).to.equal(0, "Cannot safe batch transfer");
    expect(balances[1]).to.equal(0, "Cannot safe batch transfer");
    expect(balances[2]).to.equal(1, "Cannot safe batch transfer");
    expect(balances[3]).to.equal(1, "Cannot safe batch transfer");
  });

  it("Should emit batch transfer event", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });
    await contract.mint(1, { value: ethers.parseEther("0.01") });

    await expect(
      contract.safeBatchTransferFrom(
        owner.address,
        otherAccount.address,
        [0, 1],
        [1, 1],
        "0x00000000"
      )
    )
      .to.emit(contract, "TransferBatch")
      .withArgs(
        owner.address,
        owner.address,
        otherAccount.address,
        [0, 1],
        [1, 1]
      );
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

    const instance = contract.connect(otherAccount) as Multitoken;

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

  it("Should emit approval event", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(contract.setApprovalForAll(otherAccount.address, true))
      .to.emit(contract, "ApprovalForAll")
      .withArgs(owner.address, otherAccount.address, true);
  });

  it("Should supports interface", async function () {
    const { contract } = await loadFixture(deployFixture);

    const support = await contract.supportsInterface("0xd9b67a26");

    expect(support).to.equal(true, "Does not support interface ERC-1155");
  });

  it("Should withdraw", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);
    const contractAddress = await contract.getAddress();

    const instance = contract.connect(otherAccount) as Multitoken;
    await instance.mint(0, { value: ethers.parseEther("0.01") });

    const contractBalanceBefore = await ethers.provider.getBalance(
      contractAddress
    );
    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

    await contract.withdraw();

    const contractBalanceAfter = await ethers.provider.getBalance(
      contractAddress
    );
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

    expect(contractBalanceBefore).to.equal(
      ethers.parseEther("0.01"),
      "Cannot withdraw"
    );
    expect(contractBalanceAfter).to.equal(0, "Cannot withdraw");
    expect(ownerBalanceAfter).to.greaterThan(
      ownerBalanceBefore,
      "Cannot withdraw"
    );
  });

  it("Should NOT withdraw (permission)", async function () {
    const { contract, otherAccount } = await loadFixture(deployFixture);

    const instance = contract.connect(otherAccount) as Multitoken;

    await expect(instance.withdraw()).to.be.revertedWithCustomError(
      contract,
      "OwnableUnauthorizedAccount"
    );
  });

  it("Should has URI metadata", async function () {
    const { contract } = await loadFixture(deployFixture);

    await contract.mint(0, { value: ethers.parseEther("0.01") });

    const uri = await contract.uri(0);

    expect(uri).to.equal(
      "ipfs://QmZymW65mbp4MD35FSb4K9Y4vLMVAZEtWnygwU24X4MD8T/0.json",
      "Does not have URI"
    );
  });

  it("Should NOT has URI metadata", async function () {
    const { contract } = await loadFixture(deployFixture);

    await expect(contract.uri(10)).to.be.revertedWith(
      "This token does not exist"
    );
  });
});

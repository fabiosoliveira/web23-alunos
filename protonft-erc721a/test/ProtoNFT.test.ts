import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProtoNFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const ProtoNFT = await ethers.getContractFactory("ProtoNFT");
    const contract = await ProtoNFT.deploy();

    return { contract, owner, otherAccount };
  }

  it("Should has name", async function () {
    const { contract } = await loadFixture(deployFixture);

    expect(await contract.name()).to.equal("ProtoNFT", "Can't get name");
  });

  it("Should has symbol", async function () {
    const { contract } = await loadFixture(deployFixture);

    expect(await contract.symbol()).to.equal("PNFT", "Can't get symbol");
  });

  it("Should mint", async function () {
    const { contract, owner } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });

    const balance = await contract.balanceOf(owner.address);
    const tokenId = 0;
    const ownerOf = await contract.ownerOf(tokenId);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(1, "Can't mint");
    expect(ownerOf).to.equal(owner.address, "Can't mint");
    expect(totalSupply).to.equal(1, "Can't mint");
  });

  it("Should NOT mint (payment)", async function () {
    const { contract, owner } = await loadFixture(deployFixture);

    await expect(contract.mint(1)).to.be.revertedWith("Insufficient payment");
  });

  it("Should burn", async function () {
    const { contract, owner } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;

    await contract.burn(tokenId);

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(0, "Can't burn");
    expect(totalSupply).to.equal(0, "Can't burn");
  });

  it("Should burn (approved)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;

    await contract.approve(otherAccount.address, tokenId);
    const approved = await contract.getApproved(tokenId);

    const instance = contract.connect(otherAccount);
    await instance.burn(tokenId);

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(0, "Can't burn (approved)");
    expect(totalSupply).to.equal(0, "Can't burn (approved)");
    expect(approved).to.equal(otherAccount.address, "Can't burn (approved)");
  });

  it("Should burn (approved for all)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;

    await contract.setApprovalForAll(otherAccount.address, true);
    const approved = await contract.isApprovedForAll(
      owner.address,
      otherAccount.address
    );

    const instance = contract.connect(otherAccount);
    await instance.burn(tokenId);

    const balance = await contract.balanceOf(owner.address);
    const totalSupply = await contract.totalSupply();

    expect(balance).to.equal(0, "Can't burn (approved for all)");
    expect(totalSupply).to.equal(0, "Can't burn (approved for all)");
    expect(approved).to.equal(true, "Can't burn (approved for all)");
  });

  it("Should NOT burn (not exists)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(contract.burn(1)).to.be.revertedWithCustomError(
      contract,
      "OwnerQueryForNonexistentToken"
    );
  });

  it("Should NOT burn (permission)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;
    const instance = contract.connect(otherAccount);

    await expect(instance.burn(tokenId)).to.be.revertedWithCustomError(
      contract,
      "TransferCallerNotOwnerNorApproved"
    );
  });

  it("Should has URI metadata", async function () {
    const { contract } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;

    expect(await contract.tokenURI(tokenId)).to.equal(
      "https://www.fabio.com.br/nfts/0.json",
      "Can't get URI Metadata"
    );
  });

  it("Should NOT URI metadata", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(contract.tokenURI(1)).to.be.revertedWithCustomError(
      contract,
      "URIQueryForNonexistentToken"
    );
  });

  it("Should transfer", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;

    await contract.transferFrom(owner.address, otherAccount.address, tokenId);
    const balanceFrom = await contract.balanceOf(owner.address);
    const balanceTo = await contract.balanceOf(otherAccount.address);
    const ownerOf = await contract.ownerOf(tokenId);

    expect(balanceFrom).to.equal(0, "Can't transfer");
    expect(balanceTo).to.equal(1, "Can't transfer");
    expect(ownerOf).to.equal(otherAccount.address, "Can't transfer");
  });

  it("Should emit transfer", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;

    await expect(
      contract.transferFrom(owner.address, otherAccount.address, tokenId)
    )
      .to.emit(contract, "Transfer")
      .withArgs(owner.address, otherAccount.address, tokenId);
  });

  it("Should transfer (approved)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;

    await contract.approve(otherAccount.address, tokenId);
    const approved = await contract.getApproved(tokenId);

    const instance = contract.connect(otherAccount);
    await instance.transferFrom(owner.address, otherAccount.address, tokenId);

    const ownerOf = await contract.ownerOf(tokenId);

    expect(ownerOf).to.equal(otherAccount.address, "Can't transfer (approved)");
    expect(approved).to.equal(
      otherAccount.address,
      "Can't transfer (approved)"
    );
  });

  it("Should emit approval", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;

    await expect(contract.approve(otherAccount.address, tokenId))
      .to.emit(contract, "Approval")
      .withArgs(owner.address, otherAccount.address, tokenId);
  });

  it("Should clear approvals", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;

    await contract.approve(otherAccount.address, tokenId);

    await contract.transferFrom(owner.address, otherAccount.address, tokenId);

    const approved = await contract.getApproved(tokenId);

    expect(approved).to.equal(
      "0x0000000000000000000000000000000000000000",
      "Can't clear approvals"
    );
  });

  it("Should transfer (approved for all)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;

    await contract.setApprovalForAll(otherAccount.address, true);
    const approved = await contract.isApprovedForAll(
      owner.address,
      otherAccount.address
    );

    const instance = contract.connect(otherAccount);
    await instance.transferFrom(owner.address, otherAccount.address, tokenId);

    const ownerOf = await contract.ownerOf(tokenId);

    expect(ownerOf).to.equal(
      otherAccount.address,
      "Can't transfer (approved for all)"
    );
    expect(approved).to.equal(true, "Can't transfer (approved for all)");
  });

  it("Should emit approval for all", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });

    await expect(contract.setApprovalForAll(otherAccount.address, true))
      .to.emit(contract, "ApprovalForAll")
      .withArgs(owner.address, otherAccount.address, true);
  });

  it("Should NOT transfer (permission)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await contract.mint(1, { value: ethers.parseEther("0.01") });
    const tokenId = 0;

    const instance = contract.connect(otherAccount);
    await expect(
      instance.transferFrom(owner.address, otherAccount.address, tokenId)
    ).to.be.revertedWithCustomError(
      contract,
      "TransferCallerNotOwnerNorApproved"
    );
  });

  it("Should NOT transfer (exists)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    await expect(
      contract.transferFrom(owner.address, otherAccount.address, 1)
    ).to.be.revertedWithCustomError(contract, "OwnerQueryForNonexistentToken");
  });

  it("Should supports interface", async function () {
    const { contract } = await loadFixture(deployFixture);

    expect(await contract.supportsInterface("0x80ac58cd")).to.equal(
      true,
      "Can't supports interface"
    );
  });

  it("Should withdraw", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    const ownerBalanceBefore = await ethers.provider.getBalance(owner);

    const instance = contract.connect(otherAccount);
    await instance.mint(1, { value: ethers.parseEther("0.01") });

    await contract.withdraw();

    const contractBalance = await ethers.provider.getBalance(contract);
    const ownerBalanceAfter = await ethers.provider.getBalance(owner);

    expect(contractBalance).to.equal(0, "Can't withdraw");
    expect(ownerBalanceAfter).to.greaterThan(
      ownerBalanceBefore,
      "Can't withdraw"
    );
  });

  it("Should NOT withdraw (permission)", async function () {
    const { contract, owner, otherAccount } = await loadFixture(deployFixture);

    const instance = contract.connect(otherAccount);
    await expect(instance.withdraw()).to.be.revertedWith(
      "You do not have permission"
    );
  });
});

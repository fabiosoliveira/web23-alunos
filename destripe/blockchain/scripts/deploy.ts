import { ethers } from "hardhat";

async function main() {
  const DestripeCoin = await ethers.getContractFactory("DestripeCoin");
  const destripeCoin = await DestripeCoin.deploy();

  await destripeCoin.waitForDeployment();
  const coinAddress = await destripeCoin.getAddress();
  console.log(`DestripeCoin deployed to ${coinAddress}`);

  const DestripeCollection = await ethers.getContractFactory(
    "DestripeCollection"
  );
  const destripeCollection = await DestripeCollection.deploy();

  await destripeCollection.waitForDeployment();
  const collectionAddress = await destripeCollection.getAddress();
  console.log(`DestripeCollection deployed to ${collectionAddress}`);

  const Destripe = await ethers.getContractFactory("Destripe");
  const destripe = await Destripe.deploy(coinAddress, collectionAddress);

  await destripe.waitForDeployment();
  const destripeAddress = await destripe.getAddress();
  console.log(`Destripe deployed to ${destripeAddress}`);

  await destripeCollection.setAuthorizedContract(destripeAddress);
  console.log(`Destripe authorized on DestripeCollection`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

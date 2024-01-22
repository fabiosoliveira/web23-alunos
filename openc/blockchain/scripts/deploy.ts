import { ethers } from "hardhat";

async function main() {
  const NFTMarket = await ethers.deployContract("NFTMarket");
  const nftMarket = await NFTMarket.waitForDeployment();
  const marketAddress = await nftMarket.getAddress();
  console.log(`NFTMarket deployed to ${marketAddress}`);

  const NFTCollection = await ethers.deployContract("NFTCollection", [
    marketAddress,
  ]);
  const nftCollection = await NFTCollection.waitForDeployment();
  const collectionAddress = await nftCollection.getAddress();
  console.log(`NFTCollection deployed to ${collectionAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

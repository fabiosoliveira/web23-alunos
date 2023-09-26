import { ethers } from "hardhat";

async function main() {
  const ProtoNFT = await ethers.getContractFactory("ProtoNFT");
  const contract = await ProtoNFT.deploy();

  await contract.waitForDeployment();

  console.log(`Contract was deployed at ${contract.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

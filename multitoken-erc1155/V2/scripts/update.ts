import { ethers, upgrades } from "hardhat";

async function main() {
  const Multitoken = await ethers.getContractFactory("Multitoken");
  const contract = await upgrades.upgradeProxy(
    "0x2f0de1b7AD1d68dc1E7Ca73E93074A30c3809b17",
    Multitoken
  );

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log(`Contract updated at ${address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

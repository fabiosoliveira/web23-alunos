import { ethers } from "hardhat";

async function main() {
  // deploy the CondominiumLib
  const CondominiumLib = await ethers.getContractFactory("CondominiumLib");
  const contractLib = await CondominiumLib.deploy();

  await contractLib.deployed();
  console.log(`CondominiumLib deployed to: ${contractLib.address}`);

  // deploy the Condominium
  const Condominium = await ethers.getContractFactory("Condominium");
  const contract = await Condominium.deploy();

  await contract.deployed();
  console.log(`Contract deployed to: ${contract.address}`);

  // deploy the CondominiumAdapter
  const CondominiumAdapter = await ethers.getContractFactory(
    "CondominiumAdapter"
  );
  const adapter = await CondominiumAdapter.deploy();

  await adapter.deployed();
  console.log(`CondominiumAdapter deployed to: ${adapter.address}`);

  // upgrade contract
  await adapter.upgrade(contract.address);
  console.log(`CondominiumAdapter upgraded to: ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

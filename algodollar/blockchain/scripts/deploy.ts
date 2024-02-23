import { ethers } from "hardhat";

async function main() {
  const INITIAL_ETH_PRICE = 67; //$0.67
  const INITIAL_ETH_DEPOSIT = ethers.parseEther("1");

  const algoDollar = await ethers.deployContract("AlgoDollar");
  await algoDollar.waitForDeployment();
  console.log(`AlgoDollar deployed to ${algoDollar.target}`);

  const oracle = await ethers.deployContract("WeiUsdOracle", [
    INITIAL_ETH_PRICE,
  ]);
  await oracle.waitForDeployment();
  console.log(`WeiUsdOracle deployed to ${oracle.target}`);

  const rebase = await ethers.deployContract("Rebase", [
    oracle.target,
    algoDollar.target,
  ]);
  await rebase.waitForDeployment();
  console.log(`Rebase deployed to ${rebase.target}`);

  await algoDollar.setRebase(rebase.target);

  const weisPerPenny = await oracle.getWeiRatio();
  await rebase.initialize(weisPerPenny, { value: INITIAL_ETH_DEPOSIT });
  await rebase.pause();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

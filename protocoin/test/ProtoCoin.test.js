const ProtoCoin = artifacts.require("ProtoCoin");
const BN = require("bn.js");

contract("ProtoCoin", function (accounts) {
  const DECIMALS = new BN(18);

  beforeEach(async () => {
    contract = await ProtoCoin.new();
  });

  it("should has correct name", async () => {
    const name = await contract.name();
    assert(name === "ProtoCoin", "Incorrect name");
  });

  it("should has correct symbol", async () => {
    const symbol = await contract.symbol();
    assert(symbol === "PRC", "Incorrect symbol");
  });

  it("should has correct decimal", async () => {
    const decimal = await contract.decimal();
    assert(decimal.eq(DECIMALS), "Incorrect decimals");
  });

  it("should has correct total supply", async () => {
    // const TOTAL_SUPPLY = new BN(1000).mul(new BN(10).pow(DECIMALS));
    // const totalSuply = await contract.totalSuply();
    // assert(totalSuply.eq(TOTAL_SUPPLY), "Incorrect totalSuply");
    const TOTAL_SUPPLY = BigInt(1000) * BigInt(10) ** BigInt(18);
    const totalSuply = await contract.totalSuply();
    assert(BigInt(totalSuply) === TOTAL_SUPPLY, "Incorrect totalSuply");
  });

  it("Owner should has total supply", async () => {
    const TOTAL_SUPPLY = BigInt(1000) * BigInt(10) ** BigInt(18);
    const balance = await contract.balanceOf(accounts[0]);
    assert(BigInt(balance) === TOTAL_SUPPLY, "Incorrect balance");
  });

  it("should transfer", async () => {
    const qty = BigInt(1) * BigInt(10) ** BigInt(18);

    const balanceAdminBefore = await contract.balanceOf(accounts[0]);
    const balanceToBefore = await contract.balanceOf(accounts[1]);

    await contract.transfer(accounts[1], qty);

    const balanceAdminNow = await contract.balanceOf(accounts[0]);
    const balanceToNow = await contract.balanceOf(accounts[1]);

    assert(
      BigInt(balanceAdminNow) === BigInt(balanceAdminBefore) - qty,
      "Incorrect admin balance"
    );
    assert(
      BigInt(balanceToNow) === BigInt(balanceToBefore) + qty,
      "Incorrect to balance"
    );
  });

  it("should NOT transfer", async () => {
    const qty = BigInt(1001) * BigInt(10) ** BigInt(18);

    try {
      await contract.transfer(accounts[1], qty);
      assert.fail("The transfer should have thrown an error.");
    } catch (error) {
      assert.include(
        error.message,
        "revert",
        "The transfer should be reverted."
      );
    }
  });

  it("should approve", async () => {
    const qty = BigInt(1) * BigInt(10) ** BigInt(18);
    await contract.approve(accounts[1], qty);

    const allowance = await contract.allowance(accounts[0], accounts[1]);

    assert(BigInt(allowance) === qty, "Incorrect allowance balance");
  });

  it("should transfer from", async () => {
    const qty = BigInt(1) * BigInt(10) ** BigInt(18);

    const allowanceBefore = await contract.allowance(accounts[0], accounts[1]);
    const balanceAdminBefore = await contract.balanceOf(accounts[0]);
    const balanceToBefore = await contract.balanceOf(accounts[1]);

    await contract.approve(accounts[1], qty);
    await contract.transferFrom(accounts[0], accounts[1], qty, {
      from: accounts[1],
    });

    const allowanceNow = await contract.allowance(accounts[0], accounts[1]);
    const balanceAdminNow = await contract.balanceOf(accounts[0]);
    const balanceToNow = await contract.balanceOf(accounts[1]);

    assert(
      BigInt(allowanceNow) === BigInt(allowanceBefore),
      "Incorrect allowance"
    );
    assert(
      BigInt(balanceAdminNow) === BigInt(balanceAdminBefore) - qty,
      "Incorrect admin balance"
    );
    assert(
      BigInt(balanceToNow) === BigInt(balanceToBefore) + qty,
      "Incorrect to balance"
    );
  });

  it("should NOT transfer from", async () => {
    const qty = BigInt(1) * BigInt(10) ** BigInt(18);

    try {
      await contract.transferFrom(accounts[0], accounts[1], qty, {
        from: accounts[1],
      });
      assert.fail("The transfer should have thrown an error.");
    } catch (error) {
      assert.include(
        error.message,
        "revert",
        "The transfer from should be reverted."
      );
    }
  });
});

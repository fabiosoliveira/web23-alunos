const ProtoCoin = artifacts.require("ProtoCoin");
const {
  BN, // Big Number support
  time,
} = require("@openzeppelin/test-helpers");

contract("ProtoCoin", function (accounts) {
  const DECIMALS = new BN(18);

  beforeEach(async () => {
    contract = await ProtoCoin.new();
  });

  it("should has correct name", async () => {
    const name = await contract.name();
    assert(name === "New ProtoCoin", "Incorrect name");
  });

  it("should has correct symbol", async () => {
    const symbol = await contract.symbol();
    assert(symbol === "NPC", "Incorrect symbol");
  });

  it("should has correct decimals", async () => {
    const decimal = await contract.decimals();
    assert(decimal.eq(DECIMALS), "Incorrect decimals");
  });

  it("should has correct total supply", async () => {
    // const TOTAL_SUPPLY = new BN(1000).mul(new BN(10).pow(DECIMALS));
    // const totalSuply = await contract.totalSuply();
    // assert(totalSuply.eq(TOTAL_SUPPLY), "Incorrect totalSuply");
    const TOTAL_SUPPLY = BigInt(10000000) * BigInt(10) ** BigInt(18);
    const totalSuply = await contract.totalSupply();
    assert(BigInt(totalSuply) === TOTAL_SUPPLY, "Incorrect totalSupply");
  });

  it("Owner should has total supply", async () => {
    const TOTAL_SUPPLY = BigInt(10000000) * BigInt(10) ** BigInt(18);
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
    const qty = BigInt(10000001) * BigInt(10) ** BigInt(18);

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

  it("should mint once", async () => {
    const minAmount = BigInt(10000000);
    await contract.setMintAmount(minAmount);

    const balanceBefore = await contract.balanceOf(accounts[1]);
    await contract.mint(accounts[1], { from: accounts[0] });
    const balanceNow = await contract.balanceOf(accounts[1]);

    assert(
      BigInt(balanceNow) === BigInt(balanceBefore) + minAmount,
      "Incorrect balance"
    );
  });

  it("should mint twice (different accounts)", async () => {
    const minAmount = BigInt(10000000);
    await contract.setMintAmount(minAmount);

    const balance1Before = await contract.balanceOf(accounts[1]);
    const balance2Before = await contract.balanceOf(accounts[2]);

    await contract.mint(accounts[1], { from: accounts[0] });
    await contract.mint(accounts[2], { from: accounts[0] });

    const balance1Now = await contract.balanceOf(accounts[1]);
    const balance2Now = await contract.balanceOf(accounts[2]);

    assert(
      BigInt(balance1Now) === BigInt(balance1Before) + minAmount,
      "Incorrect balance"
    );
    assert(
      BigInt(balance2Now) === BigInt(balance2Before) + minAmount,
      "Incorrect balance"
    );
  });

  it("should mint twice (different moments)", async () => {
    const minAmount = BigInt(10000000);
    await contract.setMintAmount(minAmount);

    const delayInSeconds = 1;
    await contract.setMintDelay(delayInSeconds);

    const balanceBefore = await contract.balanceOf(accounts[1]);
    await contract.mint(accounts[1], { from: accounts[0] });

    await time.increase(delayInSeconds * 2);

    await contract.mint(accounts[1], { from: accounts[0] });
    const balanceNow = await contract.balanceOf(accounts[1]);

    assert(
      BigInt(balanceNow) === BigInt(balanceBefore) + minAmount * 2n,
      "Incorrect balance"
    );
  });

  it("should NOT setMintAmount (permission)", async () => {
    try {
      await contract.setMintAmount(1000, { from: accounts[1] });
      assert.fail("The setMintAmount should have thrown an error.");
    } catch (error) {
      assert.include(
        error.message,
        "revert",
        "The setMintAmount from should be reverted."
      );
    }
  });

  it("should NOT setMintDelay (permission)", async () => {
    try {
      await contract.setMintDelay(1000, { from: accounts[1] });
      assert.fail("The setMintDelay should have thrown an error.");
    } catch (error) {
      assert.include(
        error.message,
        "revert",
        "The setMintDelay from should be reverted."
      );
    }
  });

  it("should NOT mint (disable)", async () => {
    try {
      await contract.mint(accounts[1], { from: accounts[0] });
      assert.fail("The mint should have thrown an error.");
    } catch (error) {
      assert.include(
        error.message,
        "revert",
        "The mint from should be reverted."
      );
    }
  });

  it("should NOT mint twice", async () => {
    await contract.setMintAmount(1000);

    await contract.mint(accounts[1], { from: accounts[0] });

    try {
      await contract.mint(accounts[1], { from: accounts[0] });
      assert.fail("The mint should have thrown an error.");
    } catch (error) {
      assert.include(
        error.message,
        "revert",
        "The mint from should be reverted."
      );
    }
  });

  it("should NOT mint (not owner)", async () => {
    await contract.setMintAmount(1000);

    try {
      await contract.mint(accounts[1], { from: accounts[1] });
      assert.fail("The mint should have thrown an error.");
    } catch (error) {
      assert.include(
        error.message,
        "revert",
        "The mint from should be reverted."
      );
    }
  });
});

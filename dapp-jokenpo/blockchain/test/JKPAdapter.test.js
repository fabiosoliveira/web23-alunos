const JKPAdapter = artifacts.require("JKPAdapter");
const JoKenPo = artifacts.require("JoKenPo");
const JKPLibrary = artifacts.require("JKPLibrary");

contract("JKPAdapter", function (accounts) {
  beforeEach(async () => {
    contract = await JKPAdapter.new();
  });

  it("Should get address", async () => {
    const jkp = await JoKenPo.new();
    await contract.upgrade(jkp.address);

    const address = await contract.getAddress();
    assert(address === jkp.address, "Error getting address");
  });

  it("Should get bid", async () => {
    const jkp = await JoKenPo.new();
    await contract.upgrade(jkp.address);

    const bid = await contract.getBid();
    const defaultBid = web3.utils.toBN(web3.utils.toWei("0.01", "ether"));
    assert(defaultBid.eq(bid), "Error getting bid");
  });

  it("Should NOT get bid (upgrade)", async () => {
    try {
      await contract.getBid();
      assert.fail("The getBid should have thrown an error.");
    } catch (error) {
      assert.include(error.message, "revert", "The getBid should be reverted.");
    }
  });

  it("Should get commission", async () => {
    const jkp = await JoKenPo.new();
    await contract.upgrade(jkp.address);

    const commission = await contract.getCommission();
    const defaultCommission = web3.utils.toBN("10");
    assert(defaultCommission.eq(commission), "Error getting commission");
  });

  it("Should NOT get commission (upgrade)", async () => {
    try {
      await contract.getCommission();
      assert.fail("The getCommission should have thrown an error.");
    } catch (error) {
      assert.include(
        error.message,
        "revert",
        "The getCommission should be reverted."
      );
    }
  });

  it("Should NOT upgrade (owner)", async () => {
    const jkp = await JoKenPo.new();

    try {
      await contract.upgrade(jkp.address, { from: accounts[1] });
      assert.fail("The upgrade should have thrown an error.");
    } catch (error) {
      assert.include(
        error.message,
        "revert",
        "The upgrade should be reverted."
      );
    }
  });

  it("Should NOT upgrade (address)", async () => {
    const jkp = await JoKenPo.new();

    try {
      await contract.upgrade("0x0000000000000000000000000000000000000000", {
        from: accounts[1],
      });
      assert.fail("The upgrade should have thrown an error.");
    } catch (error) {
      assert.include(
        error.message,
        "revert",
        "The upgrade should be reverted."
      );
    }
  });

  it("Should play alone by adapter", async () => {
    const jkp = await JoKenPo.new();
    await contract.upgrade(jkp.address);

    await contract.play(JKPLibrary.Options.PAPER, {
      from: accounts[1],
      value: web3.utils.toWei("0.01", "ether"),
    });

    const result = await contract.getResult();
    assert(
      result === "Player 1 choose his/her option. Waiting player 2.",
      "Error playing alone"
    );
  });

  it("Should play along by adapter", async () => {
    const jkp = await JoKenPo.new();
    await contract.upgrade(jkp.address);

    await contract.play(JKPLibrary.Options.PAPER, {
      from: accounts[1],
      value: web3.utils.toWei("0.01", "ether"),
    });
    await contract.play(JKPLibrary.Options.ROCK, {
      from: accounts[2],
      value: web3.utils.toWei("0.01", "ether"),
    });

    const result = await contract.getResult();
    assert(result === "Paper wraps rock. Player 1 won.", "Error playing alone");
  });
});

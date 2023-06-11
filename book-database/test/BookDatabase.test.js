const BookDatabase = artifacts.require("BookDatabase");

contract("BookDatabase", function (accounts) {
  beforeEach(async () => {
    contract = await BookDatabase.new();
  });

  it("should get count = 0", async () => {
    const count = await contract.count();
    assert(count.toNumber() === 0, "Count is not zero.");
  });
});

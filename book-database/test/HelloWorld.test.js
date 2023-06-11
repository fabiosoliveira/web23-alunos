const HelloWorld = artifacts.require("HelloWorld");

contract("HelloWorld", function (accounts) {
  beforeEach(async () => {
    contract = await HelloWorld.new();
  });

  it("should get Hello World", async () => {
    const message = await contract.message();
    assert(message === "Hello World!", "Message is not 'Hello World'");
  });

  it("should set message", async () => {
    await contract.setMessage("new message");

    const message = await contract.message();
    assert(message === "new message", "Message is not 'new message'");
  });
});

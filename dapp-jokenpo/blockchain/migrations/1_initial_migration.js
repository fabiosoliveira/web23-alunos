const JKPLibrary = artifacts.require("JKPLibrary");
const JoKenPo = artifacts.require("JoKenPo");
const JKPAdapter = artifacts.require("JKPAdapter");

module.exports = function (deployer) {
  deployer.deploy(JKPLibrary);
  deployer.deploy(JoKenPo);
  deployer.deploy(JKPAdapter);
};

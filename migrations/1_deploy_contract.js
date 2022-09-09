const TestNFT = artifacts.require('TestNFT');
const Staking = artifacts.require('Staking');

module.exports = async function (deployer) {
  await deployer.deploy(TestNFT);
  const instance = await TestNFT.deployed();
  await deployer.deploy(Staking, instance.address);
}
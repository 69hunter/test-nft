const TestNFT = artifacts.require('TestNFT');
const Staking = artifacts.require('Staking');
const Raka = artifacts.require('Raka');

module.exports = async function (deployer) {
  await deployer.deploy(TestNFT);
  await deployer.deploy(Raka);

  const instance = await TestNFT.deployed();
  const erc20Instance = await Raka.deployed();

  await deployer.deploy(Staking, instance.address, erc20Instance.address);
}
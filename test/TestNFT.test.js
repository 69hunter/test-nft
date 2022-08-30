const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const { expect } = chai;

const TestNFT = artifacts.require('TestNFT');

contract('TestNFT', (addresses) => {

  const [deployerAddress, minterAddress, randomAddress] = addresses;

  let instance;
  before(async () => {
    instance = await TestNFT.deployed();
  })

  it('should have correct name', async () => {
    const name = await instance.name();
    expect(name).to.be.equal('TestNFT');
  })

  it('should have correct symbol', async () => {
    const symbol = await instance.symbol();
    expect(symbol).to.be.equal('TNFT');
  })

  it('can be minted', async () => {
    const balance = await web3.eth.getBalance(minterAddress);
    const balanceInEther = web3.utils.fromWei(balance);
    console.log(balanceInEther);

    await instance.mint({ value: web3.utils.toWei('5'), from: minterAddress });
    const owner = await instance.ownerOf(1);
    expect(owner).to.be.equal(minterAddress);
  })

  it.skip('can mint 10', async () => {

    const maxSupply = await instance.maxSupply();
    const supply = await instance.totalSupply();

    for (let i = 0; i < maxSupply - supply; i++) {
      const response = await instance.mint({ from: minterAddress });
    }

    const finalSupply = await instance.totalSupply();
    expect(Number(finalSupply)).to.be.equal(10);
  })

  it.skip('cannot mint more than 10', async () => {

    const maxSupply = await instance.maxSupply();
    const supply = await instance.totalSupply();

    for (let i = 0; i < maxSupply - supply; i++) {
      const response = await instance.mint({ from: minterAddress });
    }

    const fn = instance.mint({ from: minterAddress });
    return expect(fn).to.be.rejectedWith('Exceed max supply');
  })

  it('should store some value', async () => {
    const balance = await web3.eth.getBalance(instance.address);
    expect(Number(balance)).to.be.greaterThan(0);
  })

  it('only owner be able to withdraw', async () => {
    const initialBalance = await web3.eth.getBalance(deployerAddress);
    await instance.withdraw({ from: deployerAddress });
    const finalBalance = await web3.eth.getBalance(deployerAddress);

    console.log({ initialBalance, finalBalance, diff: Number(finalBalance) - Number(initialBalance) });

    expect(Number(finalBalance)).to.be.greaterThan(Number(initialBalance));
  })

  it('other addresses cannot withdraw', async () => {
    const fn = instance.withdraw({ from: randomAddress });
    return expect(fn).to.be.rejectedWith('Ownable: caller is not the owner');
  })
})
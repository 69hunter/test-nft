const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const { expect } = chai;

const TestNFT = artifacts.require('TestNFT');
const Staking = artifacts.require('Staking');
const { advanceTimeAndBlock } = require('./utils');

contract('Staking', (addresses) => {

  const [deployerAddress, holderAddress, holderAddress2, randomAddress] = addresses;

  let nftInstance;
  let stakingInstance;

  before(async () => {
    nftInstance = await TestNFT.deployed();
    stakingInstance = await Staking.deployed();
  })

  describe('nftAddress', () => {
    it('should have the correct nftAddress', async () => {
      const nftAddress = await stakingInstance.nftAddress({ from: randomAddress });
      expect(nftAddress).to.be.equals(nftInstance.address);
    })
  })

  describe('stake', () => {
    it('can stake', async () => {
      const response = await nftInstance.mint({ value: web3.utils.toWei('5'), from: holderAddress });
      const tokenId = Number(response.logs[0].args.tokenId)

      await nftInstance.setApprovalForAll(stakingInstance.address, true, { from: holderAddress });

      await stakingInstance.stake(tokenId, { from: holderAddress });

      const owner = await nftInstance.ownerOf(tokenId, { from: randomAddress });
      expect(owner).to.be.equals(stakingInstance.address);
    })
  })

  describe('unstake', () => {
    it('cannot unstake if it is not staker', async () => {
      const response = await nftInstance.mint({ value: web3.utils.toWei('5'), from: holderAddress });
      const tokenId = Number(response.logs[0].args.tokenId)

      await nftInstance.setApprovalForAll(stakingInstance.address, true, { from: holderAddress });
      await stakingInstance.stake(tokenId, { from: holderAddress });

      const fn = stakingInstance.unstake(tokenId, { from: holderAddress2 });

      return expect(fn).to.be.rejected;
    })

    // 300 seconds = 5 minutes
    it('cannot unstake if it is less than 100 blocks', async () => {
      const response = await nftInstance.mint({ value: web3.utils.toWei('5'), from: holderAddress });
      const tokenId = Number(response.logs[0].args.tokenId)

      await nftInstance.setApprovalForAll(stakingInstance.address, true, { from: holderAddress });
      const stakingResponse = await stakingInstance.stake(tokenId, { from: holderAddress });

      const latestBlock = await web3.eth.getBlock('latest');

      expect(latestBlock.number - stakingResponse.receipt.blockNumber).to.be.lessThan(100);

      const fn = stakingInstance.unstake(tokenId, { from: holderAddress });
      return expect(fn).to.be.rejected;
    })

    it('can unstake if it is more than 100 blocks', async () => {
      const response = await nftInstance.mint({ value: web3.utils.toWei('5'), from: holderAddress });
      const tokenId = Number(response.logs[0].args.tokenId)

      await nftInstance.setApprovalForAll(stakingInstance.address, true, { from: holderAddress });
      const stakingResponse = await stakingInstance.stake(tokenId, { from: holderAddress });

      for (let i = 0; i < 100; i++) {
        await advanceTimeAndBlock(3);
      }

      const latestBlock = await web3.eth.getBlock('latest');

      expect(latestBlock.number - stakingResponse.receipt.blockNumber).to.be.greaterThanOrEqual(100);

      const fn = stakingInstance.unstake(tokenId, { from: holderAddress });
      return expect(fn).to.be.fulfilled;
    })
  })
})
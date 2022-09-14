pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    address public nftAddress;
    address public erc20Address;
    mapping(uint256 => address) tokenIdToStaker;
    mapping(uint256 => uint256) tokenIdToStartBlock;

    constructor(address _nftAddress, address _erc20Address) {
        nftAddress = address(_nftAddress);
        erc20Address = address(_erc20Address);
    }

    function stake(uint256 tokenId) external {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);
        tokenIdToStaker[tokenId] = msg.sender;
        tokenIdToStartBlock[tokenId] = block.number;
    }

    function unstake(uint256 tokenId) external {
        require(
            tokenIdToStaker[tokenId] == msg.sender,
            "You are not the staker"
        );
        require(
            tokenIdToStartBlock[tokenId] + 100 < block.number,
            "Cannot unstake below 100 blocks"
        );

        IERC20(erc20Address).transfer(msg.sender, 1 ether);
        IERC721(nftAddress).transferFrom(address(this), msg.sender, tokenId);
    }
}

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestNFT is ERC721Enumerable, Ownable {
    uint256 public maxSupply = 10;
    uint256 public price = 5 ether;

    constructor() ERC721("TestNFT", "TNFT") {
    }

    function mint() external payable {
      require(totalSupply() < maxSupply, "Exceed max supply");
      require(msg.value >= price, "Not enough eth");

      _safeMint(msg.sender, totalSupply() + 1);
    }

    function withdraw() external onlyOwner {
      payable(msg.sender).transfer(address(this).balance);
    }
}
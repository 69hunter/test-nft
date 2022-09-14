pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Raka is ERC20, Ownable {
    constructor() ERC20("Raka", "RAKA") {}

    function mint(address _address, uint256 amount) external onlyOwner {
        _mint(_address, amount);
    }
}

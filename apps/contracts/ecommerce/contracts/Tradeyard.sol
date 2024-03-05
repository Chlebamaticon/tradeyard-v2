// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Trade is Ownable {
    uint public unlockTime;
    address payable public owner;

    event CustomerOrderDeposit(uint amount, uint when, address indexed customer);
    event CustomerOrderApproved(uint when, address indexed customer);
    event CustomerOrderComplaintSubmitted(uint when, address indexed customer);

    event MerchantOrderConfirmed(uint when, address indexed merchant);
    event MerchantOrderCancelled(uint when, address indexed merchant);
    event MerchantOrderShipping(uint when, address indexed merchant);
    event MerchantOrderWithdrawal(uint amount, uint when, address indexed merchant);
    event MerchantOrderComplaintSubmitted(uint when, address indexed merchant);

    event ModeratorComplaintResolved(uint when, address indexed moderator);


    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);

        owner.transfer(address(this).balance);
    }
}

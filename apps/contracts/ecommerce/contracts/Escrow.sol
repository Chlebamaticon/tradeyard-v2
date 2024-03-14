// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import './IEscrow.sol';

contract Escrow is Ownable, IEscrow {
  address public payer;
  address public payee;
  address public tokenAddress;
  uint256 public tokenAmount;
  bool public isReleased;
  bool public isRefunded;

  event FundsDeposited(address indexed payer, uint256 amount);
  event FundsReleased(address indexed payee, uint256 amount);
  event FundsRefunded(address indexed payer, uint256 amount);

  error EscrowCallerIsNotPayer(address caller);
  error EscrowCallerIsNotPayee(address caller);
  error EscrowAlreadyReleased();
  error EscrowAlreadyRefunded();

  constructor(
    address _payer,
    address _payee,
    address _tokenAddress,
    uint256 _tokenAmount
  ) Ownable(msg.sender) {
    payer = _payer;
    payee = _payee;
    tokenAddress = _tokenAddress;
    tokenAmount = _tokenAmount;
    isReleased = false;
    isRefunded = false;
  }

  function deposit() external onlyOwner escrowNotReleased escrowNotRefunded {
    IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokenAmount);
    emit FundsDeposited(payer, tokenAmount);
  }

  function release() external onlyOwner escrowNotReleased escrowNotRefunded {
    IERC20(tokenAddress).transfer(payee, tokenAmount);
    isReleased = true;
    emit FundsReleased(payee, tokenAmount);
  }

  function refund() external onlyOwner escrowNotReleased escrowNotRefunded {
    IERC20(tokenAddress).transfer(payer, tokenAmount);
    isRefunded = true;
    emit FundsRefunded(payer, tokenAmount);
  }

  modifier escrowNotReleased() {
    if (isReleased) {
      revert EscrowAlreadyReleased();
    }
    _;
  }

  modifier escrowNotRefunded() {
    if (isRefunded) {
      revert EscrowAlreadyRefunded();
    }
    _;
  }
}

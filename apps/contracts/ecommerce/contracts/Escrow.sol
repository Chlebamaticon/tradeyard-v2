// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import './IEscrow.sol';

contract Escrow is Ownable, IEscrow {
  address payable public payer;
  address payable public payee;
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
    address payable _payer,
    address payable _payee,
    uint256 _tokenAmount,
    address _tokenAddress
  ) Ownable(msg.sender) {
    payer = _payer;
    payee = _payee;
    tokenAmount = _tokenAmount;
    tokenAddress = _tokenAddress;
    isReleased = false;
    isRefunded = false;
  }

  function deposit() external payable onlyOwner escrowNotReleased escrowNotRefunded {
    if (tokenAddress == address(0)) {
      require(msg.value == tokenAmount, "Deposit amount must be equal to token amount");
    } else {
      IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokenAmount);
    }
    emit FundsDeposited(payer, tokenAmount);
  }

  function release() external payable onlyOwner escrowNotReleased escrowNotRefunded {
    if (tokenAddress == address(0)) {
      payee.transfer(tokenAmount);
    } else {
      IERC20(tokenAddress).transfer(payee, tokenAmount);
    }
    isReleased = true;
    emit FundsReleased(payee, tokenAmount);
  }

  function refund() external payable onlyOwner escrowNotReleased escrowNotRefunded {
    if (tokenAddress == address(0)) {
      payer.transfer(tokenAmount);
    } else {
      IERC20(tokenAddress).transfer(payer, tokenAmount);
    }

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

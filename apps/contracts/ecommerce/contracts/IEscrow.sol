pragma solidity ^0.8.24;

interface IEscrow {
  function deposit() external payable;
  function release() external payable;
  function refund() external payable;
}

pragma solidity ^0.8.24;

interface IEscrow {
  function deposit() external;
  function release() external;
  function refund() external;
}

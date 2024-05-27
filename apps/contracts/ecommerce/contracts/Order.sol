// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

enum OrderStatus {
    Created,
    CustomerDeposit,
    CustomerRelease,
    CustomerComplaint,
    MerchantConfirmed,
    MerchantCancelled,
    MerchantShipping,
    MerchantShipped,
    MerchantRelease,
    MerchantComplaint,
    ModeratorComplaintReleased,
    ModeratorComplaintRefunded,
    Closed
}

contract Order is Ownable {
    event OrderCreated(
        uint when,
        address indexed customer,
        address indexed merchant,
        uint256 tokenAmount,
        address indexed tokenAddress,
        bytes _orderHash
    );
    event OrderClosed(
        uint when,
        address indexed customer,
        address indexed merchant,
        uint256 tokenAmount,
        address indexed tokenAddress,
        bytes _orderHash
    );
    event OrderStatusTransition(uint when, OrderStatus from, OrderStatus to);

    event CustomerOrderDeposit(uint when, address indexed customer);
    event CustomerOrderRelease(uint when, address indexed customer);

    event MerchantOrderConfirmed(uint when, address indexed merchant);
    event MerchantOrderCancelled(uint when, address indexed merchant);
    event MerchantOrderShipping(uint when, address indexed merchant);
    event MerchantOrderShipped(uint when, address indexed merchant);
    event MerchantOrderRelease(uint when, address indexed merchant);

    event CustomerOrderComplaint(uint when, address indexed customer);
    event MerchantOrderComplaint(uint when, address indexed merchant);
    event ModeratorComplaintReleased(
        uint when,
        address indexed moderator,
        address indexed complainer
    );
    event ModeratorComplaintRefunded(
        uint when,
        address indexed moderator,
        address indexed complainer
    );
    event ModeratorComplaintRejected(
        uint when,
        address indexed moderator,
        address indexed complainer
    );

    error InvalidStatusTransition(OrderStatus from, OrderStatus to);
    error RedemptionPeriodNotOverYet(uint256 endsAt);

    OrderStatus public status = OrderStatus.Created;
    OrderStatus private previousStatus;
    uint256 private lastTransitionAt;

    address payable public customer;
    address payable public merchant;
    uint256 public tokenAmount;
    address public tokenAddress;
    uint256 public timeoutInSeconds;
    bytes public orderHash;

    constructor(
        address payable _customer,
        address payable _merchant,
        uint256 _tokenAmount,
        address _tokenAddress,
        uint256 _timeoutInSeconds,
        bytes memory _orderHash
    ) Ownable(_msgSender()) {
        customer = _customer;
        merchant = _merchant;
        tokenAmount = _tokenAmount;
        tokenAddress = _tokenAddress;
        timeoutInSeconds = _timeoutInSeconds;
        orderHash = _orderHash;

        emit OrderCreated(
            block.timestamp,
            _customer,
            _merchant,
            _tokenAmount,
            _tokenAddress,
            _orderHash
        );
    }

    function deposit() public payable onlyCustomer {
        transition(OrderStatus.CustomerDeposit);

        _deposit();

        emit CustomerOrderDeposit(block.timestamp, customer);
    }

    function confirm() external onlyMerchant {
        transition(OrderStatus.MerchantConfirmed);

        emit MerchantOrderConfirmed(block.timestamp, merchant);
    }

    function cancel() external onlyMerchant {
        transition(OrderStatus.MerchantCancelled);

        _refund();

        emit MerchantOrderCancelled(block.timestamp, merchant);
    }

    function shipping() external onlyMerchant {
        transition(OrderStatus.MerchantShipping);

        emit MerchantOrderShipping(block.timestamp, merchant);
    }

    function shipped() external onlyMerchant {
        transition(OrderStatus.MerchantShipped);

        emit MerchantOrderShipped(block.timestamp, merchant);
    }

    function release() external onlyCustomerOrMerchant {
        if (msg.sender == customer) {
            transition(OrderStatus.CustomerRelease);
            _release();
            emit CustomerOrderRelease(block.timestamp, merchant);
        } else if (msg.sender == merchant) {
            transition(OrderStatus.MerchantRelease);
            _release();
            emit MerchantOrderRelease(block.timestamp, merchant);
        }
    }

    function submitComplaint() external onlyCustomerOrMerchant {
        if (msg.sender == customer) {
            transition(OrderStatus.CustomerComplaint);
            emit CustomerOrderComplaint(block.timestamp, customer);
        } else if (msg.sender == merchant) {
            transition(OrderStatus.MerchantComplaint);
            emit MerchantOrderComplaint(block.timestamp, merchant);
        }
    }

function releaseComplaint() external onlyOwner {
    transition(OrderStatus.ModeratorComplaintReleased);

    _release();
    emit ModeratorComplaintReleased(
        block.timestamp,
        _msgSender(),
        customer
    );
}

function refundComplaint() external onlyOwner {
    transition(OrderStatus.ModeratorComplaintRefunded);

    _refund();
    emit ModeratorComplaintRefunded(
        block.timestamp,
        _msgSender(),
        merchant
    );
}

function rejectComplaint() external onlyOwner {
    transition(previousStatus);

    emit ModeratorComplaintRejected(
        block.timestamp,
        _msgSender(),
        customer
    );
}

    function transition(
        OrderStatus _nextStatus
    ) internal validateTransition(_nextStatus) {
        OrderStatus _currentStatus = status;
        status = _nextStatus;
        previousStatus = _currentStatus;
        lastTransitionAt = block.timestamp;
        emit OrderStatusTransition(
            lastTransitionAt,
            _currentStatus,
            _nextStatus
        );
    }

    function _release() internal {
        if (tokenAddress == address(0)) {
          merchant.transfer(tokenAmount);
        } else {
          IERC20(tokenAddress).transfer(merchant, tokenAmount);
        }
    }

    function _refund() internal {
        if (tokenAddress == address(0)) {
          customer.transfer(tokenAmount);
        } else {
          IERC20(tokenAddress).transfer(customer, tokenAmount);
        }
    }

    function _deposit() internal {
        if (tokenAddress == address(0)) {
          require(msg.value == tokenAmount, "Insufficient deposit been made");
        } else {
          IERC20(tokenAddress).transferFrom(
              msg.sender,
              address(this),
              tokenAmount
          );
        }
    }

    modifier onlyCustomerOrMerchant() {
        require(
            msg.sender == customer || msg.sender == merchant,
            'Caller is not the customer, nor the merchant'
        );
        _;
    }

    function getStatus() external view returns (OrderStatus) {
        return status;
    }

    function getPreviousStatus() external view returns (OrderStatus) {
        return previousStatus;
    }

    function getOrderHash() external view returns (bytes memory) {
        return orderHash;
    }

    function getTokenAmount() external view returns (uint256) {
        return tokenAmount;
    }

    function getTokenAddress() external view returns (address) {
        return tokenAddress;
    }

    function getLastTransitionAt() external view returns (uint256) {
        return lastTransitionAt;
    }

    function getCustomerAddress() external view returns (address) {
        return customer;
    }

    function getMerchantAddress() external view returns (address) {
        return merchant;
    }

    modifier onlyCustomer() {
        require(msg.sender == customer, 'Caller is not the customer');
        _;
    }

    modifier onlyMerchant() {
        require(msg.sender == merchant, 'Caller is not the merchant');
        _;
    }

    modifier validateTransition(OrderStatus _nextStatus) {
        OrderStatus _currentStatus = status;
        if (
            _nextStatus == OrderStatus.MerchantComplaint ||
            _nextStatus == OrderStatus.CustomerComplaint
        ) {
            if (
                _currentStatus == OrderStatus.Created ||
                _currentStatus == OrderStatus.Closed ||
                _currentStatus == OrderStatus.MerchantComplaint ||
                _currentStatus == OrderStatus.CustomerComplaint
            ) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else if (_currentStatus == OrderStatus.Created) {
            if (_nextStatus != OrderStatus.CustomerDeposit) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else if (_currentStatus == OrderStatus.CustomerDeposit) {
            if (
                _nextStatus != OrderStatus.MerchantConfirmed &&
                _nextStatus != OrderStatus.MerchantCancelled
            ) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else if (_currentStatus == OrderStatus.MerchantConfirmed) {
            if (_nextStatus != OrderStatus.MerchantShipping) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else if (_currentStatus == OrderStatus.MerchantShipping) {
            if (_nextStatus != OrderStatus.MerchantShipped) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else if (_currentStatus == OrderStatus.MerchantShipped) {
            if (_nextStatus == OrderStatus.MerchantRelease) {
                if (lastTransitionAt + timeoutInSeconds > block.timestamp) {
                    revert RedemptionPeriodNotOverYet(
                        lastTransitionAt + timeoutInSeconds
                    );
                }
            }
            if (
                _nextStatus != OrderStatus.CustomerRelease &&
                _nextStatus != OrderStatus.MerchantRelease
            ) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else if (_currentStatus == OrderStatus.CustomerRelease) {
            if (_nextStatus != OrderStatus.MerchantRelease) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else if (_currentStatus == OrderStatus.MerchantRelease) {
            if (_nextStatus != OrderStatus.Closed) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else if (_currentStatus == OrderStatus.CustomerComplaint) {
            if (
                _nextStatus != OrderStatus.ModeratorComplaintReleased &&
                _nextStatus != OrderStatus.ModeratorComplaintRefunded &&
                _nextStatus != previousStatus
            ) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else if (_currentStatus == OrderStatus.MerchantComplaint) {
            if (
                _nextStatus != OrderStatus.ModeratorComplaintReleased &&
                _nextStatus != OrderStatus.ModeratorComplaintRefunded &&
                _nextStatus != previousStatus
            ) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else if (_currentStatus != OrderStatus.ModeratorComplaintReleased) {
            if (_nextStatus != OrderStatus.Closed) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else if (_currentStatus == OrderStatus.ModeratorComplaintRefunded) {
            if (_nextStatus != OrderStatus.Closed) {
                revert InvalidStatusTransition(_currentStatus, _nextStatus);
            }
        } else {
            revert InvalidStatusTransition(_currentStatus, _nextStatus);
        }
        _;
    }
}

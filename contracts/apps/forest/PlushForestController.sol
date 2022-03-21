// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@plushfamily/plush-protocol-contracts/contracts/templates/apps/PlushController.sol";

contract PlushForestController is PlushController {
    constructor(address _plushAddress, address _plushCoinWalletsAddress) PlushController(_plushAddress, _plushCoinWalletsAddress) {
    }
}
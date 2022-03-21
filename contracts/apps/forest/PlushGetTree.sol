// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "@plushfamily/plush-protocol-contracts/contracts/token/ERC20/Plush.sol";
import "@plushfamily/plush-protocol-contracts/contracts/templates/apps/PlushController.sol";

import "./token/ERC721/PlushForest.sol";

/// @custom:security-contact security@plush.family
contract PlushGetTree is Ownable {

    PlushForest plushForest;
    Plush plush;
    PlushController plushController;

    bool public isActive;

    mapping(string => Tree) treeMap;

    struct Tree {
        bool isValid;
        string name;
        uint256 price;
        uint256 count;
    }

    constructor(address _plushForestAddress, address _plushAddress, address _plushControllerAddress)
    {
        isActive = true;
        plushForest = PlushForest(_plushForestAddress);
        plush = Plush(_plushAddress);
        plushController = PlushController(_plushControllerAddress);
    }

    function addTreeType(string memory _type, uint256 _price, uint256 _count) external onlyOwner {
        require(!treeMap[_type].isValid, "This type of tree already exists");

        treeMap[_type] = Tree(true, _type, _price, _count);
    }

    function removeTreeType(string memory _type) external onlyOwner {
        require(treeMap[_type].isValid, "Not a valid tree type.");
        delete treeMap[_type];
    }

    function getTreeTypeCount(string memory _type) external view returns(uint256) {
        require(treeMap[_type].isValid, "Not a valid tree type.");
        return treeMap[_type].count;
    }

    function getTreeTypePrice(string memory _type) external view returns(uint256) {
        require(treeMap[_type].isValid, "Not a valid tree type.");
        return treeMap[_type].price;
    }

    function setTreeTypePrice(string memory _type, uint256 _price) external onlyOwner {
        require(isActive);
        require(treeMap[_type].isValid, "Not a valid tree type.");
        require(_price > 0);
        treeMap[_type].price = _price;
    }

    function setTreeTypeCount(string memory _type, uint256 _count) external onlyOwner {
        require(isActive);
        require(treeMap[_type].isValid, "Not a valid tree type.");
        treeMap[_type].count = _count;
    }

    function mint(address _mintAddress, uint256 _amount, string memory _type) public {
        require(isActive);
        require(treeMap[_type].isValid, "Not a valid tree type.");
        require(treeMap[_type].count > 0, "The trees are over.");
        require(_amount == treeMap[_type].price, "Minting fee");

        plushController.decreaseWalletAmountTrans(msg.sender, _amount);
        plushForest.safeMint(_mintAddress);
        treeMap[_type].count = treeMap[_type].count - 1;
    }

    function changeContractStatus() public onlyOwner {
        isActive = !isActive;
    }
}
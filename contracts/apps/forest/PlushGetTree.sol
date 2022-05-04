// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "@plushfamily/plush-protocol-contracts/contracts/finance/PlushAccounts.sol";
import "@plushfamily/plush-protocol-contracts/contracts/templates/apps/PlushController.sol";

import "./IPlushGetTree.sol";
import "./token/ERC721/PlushForest.sol";

/// @custom:security-contact security@plush.family
contract PlushGetTree is Initializable, PausableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable, IPlushGetTree {
    PlushForest private plushForest;
    PlushAccounts private plushAccounts;
    PlushController private plushController;

    mapping(bytes32 => Tree) public trees;

    /**
     * @dev Roles definitions
     */
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(address plushForestAddress, address plushAccountsAddress, address plushControllerAddress) initializer public {
        plushForest = PlushForest(plushForestAddress);
        plushAccounts = PlushAccounts(plushAccountsAddress);
        plushController = PlushController(plushControllerAddress);

        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    /// @notice Pause contract
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Unpause contract
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @notice Add new tree type
     * @param treeType Tree type in bytes32
     * @param price Cost per unit in PLSH (price in wei)
     * @param count The number of available trees for purchase of this type
     */
    function addTreeType(bytes32 treeType, uint256 price, uint256 count) external onlyRole(OPERATOR_ROLE) {
        require(!trees[treeType].exists, "This type of tree already exists");

        trees[treeType] = Tree(treeType, price, count, true);
    }

    /**
     * @notice Remove tree type in contract memory
     * @param treeType Tree type in bytes32
     */
    function removeTreeType(bytes32 treeType) external onlyRole(OPERATOR_ROLE) {
        require(trees[treeType].exists, "Not a valid tree type");

        delete trees[treeType];
    }

    /**
     * @notice Get tree info
     * @param treeType Tree type in bytes32
     */
    function getTreeTypeInfo(bytes32 treeType) external view returns (Tree memory info) {
        return trees[treeType];
    }

    /**
     * @notice Get tree type count
     * @param treeType Tree type in bytes32
     * @return Count of trees of a given type
     */
    function getTreeTypeCount(bytes32 treeType) external view returns(uint256) {
        require(trees[treeType].exists, "Not a valid tree type");

        return trees[treeType].count;
    }

    /**
     * @notice Get tree type price
     * @param treeType Tree type in bytes32
     * @return The cost of a tree of a given type in wei
     */
    function getTreeTypePrice(bytes32 treeType) external view returns(uint256) {
        require(trees[treeType].exists, "Not a valid tree type");

        return trees[treeType].price;
    }

    /**
     * @notice Set tree type price
     * @param treeType Tree type in bytes32
     * @param price The cost of a tree in wei
     */
    function setTreeTypePrice(bytes32 treeType, uint256 price) external onlyRole(OPERATOR_ROLE) {
        require(trees[treeType].exists, "Not a valid tree type");
        trees[treeType].price = price;
    }

    /**
     * @notice Set tree type count
     * @param treeType Tree type in bytes32
     * @param count Count of trees
     */
    function setTreeTypeCount(bytes32 treeType, uint256 count) external onlyRole(OPERATOR_ROLE) {
        require(trees[treeType].exists, "Not a valid tree type");
        trees[treeType].count = count;
    }

    /**
     * @notice Buying a tree
     * @param treeType Tree type in bytes32
     * @param mintAddress Address where to enroll the tree after purchase
     */
    function buyTree(bytes32 treeType, address mintAddress) public {
        require(trees[treeType].exists, "Not a valid tree type");
        require(trees[treeType].count > 0, "The trees are over");
        require(plushAccounts.getWalletAmount(msg.sender) >= trees[treeType].price, "Not enough PLSH tokens in PlushAccounts");

        plushController.decreaseWalletAmountTrans(msg.sender, trees[treeType].price);
        plushForest.safeMint(mintAddress);
        trees[treeType].count -= 1;

        emit TreeBought(msg.sender, mintAddress, treeType, trees[treeType].price);
    }

    function _authorizeUpgrade(address newImplementation)
    internal
    onlyRole(UPGRADER_ROLE)
    override
    {}
}
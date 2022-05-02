// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "@plushfamily/plush-protocol-contracts/contracts/token/ERC20/Plush.sol";
import "@plushfamily/plush-protocol-contracts/contracts/finance/PlushAccounts.sol";
import "@plushfamily/plush-protocol-contracts/contracts/templates/apps/PlushController.sol";

import "./token/ERC721/PlushForest.sol";

/// @custom:security-contact security@plush.family
contract PlushGetTree is Initializable, PausableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {

    PlushForest plushForest;
    Plush plush;
    PlushAccounts plushAccounts;
    PlushController plushController;

    /// @notice Emitted when a tree is bought
    event TreeBought(
        address indexed buyer,
        address indexed recipient,
        bytes32 indexed treeType,
        uint256 purchaseAmount
    );

    // Trees available for purchase
    struct Tree {
        bytes32 treeType;
        uint256 price;
        uint256 count;
        bool exists;
    }

    mapping(bytes32 => Tree) public trees;

    /**
     * @dev Roles definitions
     */
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(address _plushForestAddress, address _plushAddress, address _plushAccountsAddress, address _plushControllerAddress) initializer public {
        plushForest = PlushForest(_plushForestAddress);
        plush = Plush(_plushAddress);
        plushAccounts = PlushAccounts(_plushAccountsAddress);
        plushController = PlushController(_plushControllerAddress);

        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function isTreeExist(bytes32 key) private view returns (bool) {
        if(trees[key].exists){
            return true;
        }
        return false;
    }

    function addTreeType(bytes32 _treeType, uint256 _price, uint256 _count) external onlyRole(OPERATOR_ROLE) {
        require(!isTreeExist(_treeType), "This type of tree already exists");

        Tree memory addNewTree = Tree({
        treeType: _treeType,
        price: _price,
        count: _count,
        exists: true
        });

        trees[_treeType] = addNewTree;
    }

    function removeTreeType(bytes32 _treeType) external onlyRole(OPERATOR_ROLE) {
        require(isTreeExist(_treeType), "Not a valid tree type");
        delete trees[_treeType];
    }

    function getTreeTypeInfo(bytes32 _treeType) public view returns (Tree memory info) {
        return trees[_treeType];
    }

    function getTreeTypeCount(bytes32 _treeType) external view returns(uint256) {
        require(isTreeExist(_treeType), "Not a valid tree type");
        return trees[_treeType].count;
    }

    function getTreeTypePrice(bytes32 _treeType) external view returns(uint256) {
        require(isTreeExist(_treeType), "Not a valid tree type");
        return trees[_treeType].price;
    }

    function setTreeTypePrice(bytes32 _treeType, uint256 _price) external onlyRole(OPERATOR_ROLE) {
        require(isTreeExist(_treeType), "Not a valid tree type");
        trees[_treeType].price = _price;
    }

    function setTreeTypeCount(bytes32 _treeType, uint256 _count) external onlyRole(OPERATOR_ROLE) {
        require(isTreeExist(_treeType), "Not a valid tree type");
        trees[_treeType].count = _count;
    }

    function buyTree(bytes32 _treeType, address _mintAddress) public {
        require(isTreeExist(_treeType), "Not a valid tree type");
        require(trees[_treeType].count > 0, "The trees are over");
        require(plushAccounts.getWalletAmount(msg.sender) >= trees[_treeType].price, "There are not enough PLSH tokens in your PlushAccounts account");

        plushController.decreaseWalletAmountTrans(msg.sender, trees[_treeType].price);
        plushForest.safeMint(_mintAddress);
        trees[_treeType].count -= 1;

        emit TreeBought(msg.sender, _mintAddress, _treeType, trees[_treeType].price);
    }

    function _authorizeUpgrade(address newImplementation)
    internal
    onlyRole(UPGRADER_ROLE)
    override
    {}
}
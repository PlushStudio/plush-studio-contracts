// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@plushfamily/plush-protocol-contracts/contracts/token/ERC20/Plush.sol";
import "@plushfamily/plush-protocol-contracts/contracts/templates/apps/PlushController.sol";

import "./token/ERC721/PlushForest.sol";

/// @custom:security-contact security@plush.family
contract PlushGetTree is Initializable, PausableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    PlushForest plushForest;
    Plush plush;
    PlushController plushController;

    mapping(string => Tree) treeMap;
    string[] treesTypes;

    struct Tree {
        bool isValid;
        string name;
        uint256 price;
        uint256 count;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(address _plushForestAddress, address _plushAddress, address _plushControllerAddress) initializer public
    {
        plushForest = PlushForest(_plushForestAddress);
        plush = Plush(_plushAddress);
        plushController = PlushController(_plushControllerAddress);

        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function pause() public onlyRole(PAUSER_ROLE)
    {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE)
    {
        _unpause();
    }

    function addTreeType(string memory _type, uint256 _price, uint256 _count) external onlyRole(OPERATOR_ROLE)
    {
        require(!treeMap[_type].isValid, "This type of tree already exists");

        treeMap[_type] = Tree(true, _type, _price, _count);
        treesTypes.push(_type);
    }

    function removeTreeType(string memory _type) external onlyRole(OPERATOR_ROLE)
    {
        require(treeMap[_type].isValid, "Not a valid tree type.");

        for(uint256 i = 0; i < treesTypes.length; i++){
            if(stringsEquals(treesTypes[i], _type)){
                delete treesTypes[i];
            }
        }

        delete treeMap[_type];
    }

    function getTreeTypeCount(string memory _type) external view returns(uint256)
    {
        require(treeMap[_type].isValid, "Not a valid tree type.");
        return treeMap[_type].count;
    }

    function getTreeTypePrice(string memory _type) external view returns(uint256)
    {
        require(treeMap[_type].isValid, "Not a valid tree type.");
        return treeMap[_type].price;
    }

    function getTreesTypes() external view returns(string memory)
    {
        string memory resultString = "";

        for(uint256 i = 0; i < treesTypes.length; i++){
            resultString = concatenate(resultString, treesTypes[i]);

            if(i + 1 < treesTypes.length){
                resultString = concatenate(resultString, ",");
            }
        }

        return resultString;
    }

    function setTreeTypePrice(string memory _type, uint256 _price) external onlyRole(OPERATOR_ROLE)
    {
        require(treeMap[_type].isValid, "Not a valid tree type.");
        require(_price > 0);
        treeMap[_type].price = _price;
    }

    function setTreeTypeCount(string memory _type, uint256 _count) external onlyRole(OPERATOR_ROLE)
    {
        require(treeMap[_type].isValid, "Not a valid tree type.");
        treeMap[_type].count = _count;
    }

    function mint(address _mintAddress, uint256 _amount, string memory _type) public
    {
        require(treeMap[_type].isValid, "Not a valid tree type.");
        require(treeMap[_type].count > 0, "The trees are over.");
        require(_amount == treeMap[_type].price, "Minting fee");

        plushController.decreaseWalletAmountTrans(msg.sender, _amount);
        plushForest.safeMint(_mintAddress);
        treeMap[_type].count = treeMap[_type].count - 1;
    }

    function concatenate(string memory a,string memory b) private pure returns (string memory)
    {
        return string(bytes.concat(bytes(a), " ", bytes(b)));
    }

    function stringsEquals(string memory s1, string memory s2) private pure returns (bool)
    {
        bytes memory b1 = bytes(s1);
        bytes memory b2 = bytes(s2);
        uint256 l1 = b1.length;

        if (l1 != b2.length) return false;

        for (uint256 i=0; i<l1; i++) {
            if (b1[i] != b2[i]) return false;
        }

        return true;
    }

    function _authorizeUpgrade(address newImplementation)
    internal
    onlyRole(UPGRADER_ROLE)
    override
    {}
}
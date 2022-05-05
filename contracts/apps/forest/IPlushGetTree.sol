// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IPlushGetTree {

    // Trees available for purchase
    struct Tree {
        bytes32 treeType;
        uint256 price;
        uint256 count;
        bool exists;
    }

    /// @notice Pause contract
    function pause() external;

    /// @notice Unpause contract
    function unpause() external;

    /**
     * @notice Add new tree type
     * @param treeType Tree type in bytes32
     * @param price Cost per unit in PLSH (price in wei)
     * @param count The number of available trees for purchase of this type
     */
    function addTreeType(bytes32 treeType, uint256 price, uint256 count) external;

    /**
     * @notice Remove tree type in contract memory
     * @param treeType Tree type in bytes32
     */
    function removeTreeType(bytes32 treeType) external;

    /**
     * @notice Get all types in string
     */
    function getTreesTypes() external view returns(string memory);

    /**
     * @notice Get tree info
     * @param treeType Tree type in bytes32
     */
    function getTreeTypeInfo(bytes32 treeType) external view returns (Tree memory info);

    /**
     * @notice Get tree type count
     * @param treeType Tree type in bytes32
     * @return Count of trees of a given type
     */
    function getTreeTypeCount(bytes32 treeType) external view returns(uint256);

    /**
     * @notice Get tree type price
     * @param treeType Tree type in bytes32
     * @return The cost of a tree of a given type in wei
     */
    function getTreeTypePrice(bytes32 treeType) external view returns(uint256);

    /**
     * @notice Set tree type price
     * @param treeType Tree type in bytes32
     * @param price The cost of a tree in wei
     */
    function setTreeTypePrice(bytes32 treeType, uint256 price) external;

    /**
     * @notice Set tree type count
     * @param treeType Tree type in bytes32
     * @param count Count of trees
     */
    function setTreeTypeCount(bytes32 treeType, uint256 count) external;

    /**
     * @notice Buying a tree
     * @param treeType Tree type in bytes32
     * @param mintAddress Address where to enroll the tree after purchase
     */
    function buyTree(bytes32 treeType, address mintAddress) external;

    /// @notice Emitted when a tree is bought
    event TreeBought(
        address indexed buyer,
        address indexed recipient,
        bytes32 indexed treeType,
        uint256 purchaseAmount
    );
}
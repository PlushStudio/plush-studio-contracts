// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPlushOrigin {

    // Connection lifespan
    struct Connection {
        uint256 lifespanParentId;
        uint256 lifespanChildId;
        uint256 typeConnectionId;
        uint256 dateStart;
        uint256 dateEnd;
        bool isActive;
        bool isDeleted;
    }

    // Connection type
    struct ConnectionType {
        uint256 id;
        uint256 swapId;
        bool isDeleted;
    }

    /// @notice Pause contract
    function pause() external;

    /// @notice Unpause contract
    function unpause() external;

    /**
     * @notice Get all connections by Lifespan id
     * @param lifespanParentId id ERC721 parent token
     */
    function getOrigin(uint256 lifespanParentId) external view returns(uint256[] memory);

    /**
     * @notice Get tuple connection by id
     * @param connectionId connection id
     * @return connection struct of id
     */
    function getConnectionById(uint256 connectionId) external view returns(Connection memory);

    /**
     * @notice set date start connection
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     * @param startDate date start connection
     */
    function setStartDate(uint256 lifespanParentId, uint256 lifespanChildId, uint256 startDate) external;

    /**
     * @notice set date end connection
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     * @param endDate date end connection
     */
    function setEndDate(uint256 lifespanParentId, uint256 lifespanChildId, uint256 endDate) external;

    /**
     * @notice Add new connection Lifespan
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     * @param typeConnectionId type of connection type
     * @param dateStart date when connection start
     * @param dateEnd date when connection end
     */
    function addConnection(uint256 lifespanParentId, uint256 lifespanChildId, uint256 typeConnectionId, uint256 dateStart, uint256 dateEnd) external;

    /**
     * @notice Remove connection
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     */
    function removeConnection(uint256 lifespanParentId, uint256 lifespanChildId) external;

    /**
     * @notice Approve connection
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     */
    function approveConnection(uint256 lifespanParentId, uint256 lifespanChildId) external;

    /**
     * @notice Add new connection type
     * @param typeConnectionId id type of new connection
     * @param typeConnectionSwapId id type of new swap connection
     */
    function addConnectionType(uint256 typeConnectionId, uint256 typeConnectionSwapId) external;

    /**
     * @notice Add new connection type
     * @param idType id type of connection
     */
    function removeConnectionType(uint256 idType) external;

    /// @notice Emitted when new connection created
    event ConnectionAdded(
        address indexed creator,
        uint256 indexed idParentToken,
        uint256 indexed idChildToken,
        uint256 connection
    );

    /// @notice Emitted when connection removed
    event ConnectionRemoved(
        address indexed creator,
        uint256 indexed idParentToken,
        uint256 indexed idChildToken
    );

    /// @notice Emitted when new connection type created
    event ConnectionTypeAdded(
        address indexed creator,
        uint256 idType,
        uint256 idTypeSwap
    );

    /// @notice Emitted when new connection type removed
    event ConnectionTypeRemoved(
        address indexed creator,
        uint256 idType
    );
}

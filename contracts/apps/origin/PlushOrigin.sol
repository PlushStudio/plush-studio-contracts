// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./interfaces/IPlushOrigin.sol";

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@plushfamily/plush-protocol-contracts/contracts/token/ERC721/LifeSpan.sol";

contract PlushOrigin is
    IPlushOrigin,
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    LifeSpan public lifespan;
    ConnectionType[] private connectionsTypes;
    Connection[] private connections;

    mapping(uint256 => uint256[]) private connectionsById;

    /**
     * @dev Roles definitions
     */
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(LifeSpan _lifespan) public initializer {
        lifespan = _lifespan;

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
     * @notice Get all connections by Lifespan id
     * @param lifespanParentId id ERC721 parent token
     */
    function getOrigin(uint256 lifespanParentId)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory idsByLifespan = connectionsById[lifespanParentId];
        uint256[] memory origin = new uint256[](
            getCountNotDeletedConnections(idsByLifespan)
        );

        uint256 counter = 0;

        for (uint256 i = 0; i < idsByLifespan.length; i++) {
            Connection memory connection = connections[idsByLifespan[i]];

            if (!connection.isDeleted) {
                origin[counter] = idsByLifespan[i];
                counter++;
            }
        }

        return origin;
    }

    /**
     * @notice Get tuple connection by id
     * @param connectionId connection id
     * @return connection struct of id
     */
    function getConnectionById(uint256 connectionId)
        external
        view
        returns (Connection memory)
    {
        return connections[connectionId];
    }

    /**
     * @notice set date start connection
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     * @param startDate date start connection
     */
    function setStartDate(
        uint256 lifespanParentId,
        uint256 lifespanChildId,
        uint256 startDate
    ) external {
        require(
            lifespan.ownerOf(lifespanParentId) == msg.sender,
            "No rights to LifeSpan token"
        );
        require(
            isConnectionExist(lifespanParentId, lifespanChildId),
            "Connection doesn't exist"
        );

        uint256[] memory idsByLifespan = connectionsById[lifespanParentId];

        for (uint256 i = 0; i < idsByLifespan.length; i++) {
            Connection memory connection = connections[idsByLifespan[i]];

            if (
                connection.lifespanParentId == lifespanParentId &&
                connection.lifespanChildId == lifespanChildId
            ) {
                connections[idsByLifespan[i]].dateStart = startDate;

                break;
            }
        }
    }

    /**
     * @notice set date end connection
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     * @param endDate date end connection
     */
    function setEndDate(
        uint256 lifespanParentId,
        uint256 lifespanChildId,
        uint256 endDate
    ) external {
        require(
            lifespan.ownerOf(lifespanParentId) == msg.sender,
            "No rights to LifeSpan token"
        );
        require(
            isConnectionExist(lifespanParentId, lifespanChildId),
            "Connection doesn't exist"
        );

        uint256[] memory idsByLifespan = connectionsById[lifespanParentId];

        for (uint256 i = 0; i < idsByLifespan.length; i++) {
            Connection memory connection = connections[idsByLifespan[i]];

            if (
                connection.lifespanParentId == lifespanParentId &&
                connection.lifespanChildId == lifespanChildId
            ) {
                connections[idsByLifespan[i]].dateEnd = endDate;

                break;
            }
        }
    }

    /**
     * @notice Add new connection LifeSpan
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     * @param typeConnectionId type of connection type
     * @param dateStart date when connection start
     * @param dateEnd date when connection end
     */
    function addConnection(
        uint256 lifespanParentId,
        uint256 lifespanChildId,
        uint256 typeConnectionId,
        uint256 dateStart,
        uint256 dateEnd
    ) external {
        require(
            lifespan.ownerOf(lifespanParentId) ==
                address(lifespan.ownerOf(lifespanParentId)),
            "Nonexistent parent token"
        );
        require(
            lifespan.ownerOf(lifespanChildId) ==
                address(lifespan.ownerOf(lifespanChildId)),
            "Nonexistent child token"
        );
        require(
            lifespan.ownerOf(lifespanParentId) == msg.sender,
            "No rights to LifeSpan token"
        );
        require(lifespanParentId != lifespanChildId, "Connection not possible");
        require(
            isConnectionTypeExist(typeConnectionId),
            "Connection type unknown"
        );
        require(
            !isConnectionExist(lifespanParentId, lifespanChildId),
            "Connection already exist"
        );

        bool isActiveConnection = true;
        ConnectionType memory connectionType = getConnectionType(
            typeConnectionId
        );

        addConnectionToDB(
            lifespanParentId,
            lifespanChildId,
            connectionType.id,
            dateStart,
            dateEnd,
            isActiveConnection
        );

        if (!isConnectionExist(lifespanChildId, lifespanParentId)) {
            if (
                lifespan.ownerOf(lifespanParentId) !=
                lifespan.ownerOf(lifespanChildId)
            ) {
                isActiveConnection = false;
            }

            addConnectionToDB(
                lifespanChildId,
                lifespanParentId,
                connectionType.swapId,
                dateStart,
                dateEnd,
                isActiveConnection
            );
        }
    }

    /**
     * @notice Remove connection
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     */
    function removeConnection(uint256 lifespanParentId, uint256 lifespanChildId)
        external
    {
        require(
            lifespan.ownerOf(lifespanParentId) == msg.sender,
            "No rights to LifeSpan token"
        );
        require(
            isConnectionExist(lifespanParentId, lifespanChildId),
            "Connection doesn't exist"
        );

        uint256[] memory idsByLifespan = connectionsById[lifespanParentId];

        for (uint256 i = 0; i < idsByLifespan.length; i++) {
            if (
                connections[idsByLifespan[i]].lifespanChildId == lifespanChildId
            ) {
                connections[idsByLifespan[i]].isDeleted = true;
                emit ConnectionRemoved(
                    msg.sender,
                    lifespanParentId,
                    lifespanChildId
                );

                break;
            }
        }
    }

    /**
     * @notice Approve connection
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     */
    function approveConnection(
        uint256 lifespanParentId,
        uint256 lifespanChildId
    ) external {
        require(
            lifespan.ownerOf(lifespanParentId) == msg.sender,
            "No rights to LifeSpan token"
        );
        require(
            isConnectionExist(lifespanParentId, lifespanChildId),
            "Connection doesn't exist"
        );

        uint256[] memory idsByLifespan = connectionsById[lifespanParentId];

        for (uint256 i = 0; i < idsByLifespan.length; i++) {
            if (
                connections[idsByLifespan[i]].lifespanChildId == lifespanChildId
            ) {
                connections[idsByLifespan[i]].isActive = true;

                break;
            }
        }
    }

    /**
     * @notice Add new connection type
     * @param typeConnectionId id type of new connection
     * @param typeConnectionSwapId id type of new swap connection
     */
    function addConnectionType(
        uint256 typeConnectionId,
        uint256 typeConnectionSwapId
    ) external onlyRole(OPERATOR_ROLE) {
        require(
            !isConnectionTypeExist(typeConnectionId),
            "Connection type exist"
        );

        ConnectionType memory connectionType = ConnectionType(
            typeConnectionId,
            typeConnectionSwapId,
            false
        );
        connectionsTypes.push(connectionType);

        emit ConnectionTypeAdded(
            msg.sender,
            typeConnectionId,
            typeConnectionSwapId
        );
    }

    /**
     * @notice Add new connection type
     * @param typeConnectionId id type of connection
     */
    function removeConnectionType(uint256 typeConnectionId)
        external
        onlyRole(OPERATOR_ROLE)
    {
        require(
            isConnectionTypeExist(typeConnectionId),
            "Connection doesn't exist"
        );

        for (uint256 i = 0; i < connectionsTypes.length; i++) {
            if (connectionsTypes[i].id == typeConnectionId) {
                connectionsTypes[i].isDeleted = true;

                emit ConnectionTypeRemoved(msg.sender, typeConnectionId);
            }
        }
    }

    /**************************************
     *         PRIVATE FUNCTIONS         *
     **************************************/

    /**
     * @notice Get connection type by id
     * @param typeConnectionId id type of connection
     */
    function getConnectionType(uint256 typeConnectionId)
        private
        view
        returns (ConnectionType memory)
    {
        ConnectionType memory connectionType;

        for (uint256 i = 0; i < connectionsTypes.length; i++) {
            if (connectionsTypes[i].id == typeConnectionId) {
                connectionType = connectionsTypes[i];

                break;
            }
        }

        return connectionType;
    }

    /**
     * @notice Checking for the existence of such a connection type
     * @param typeConnectionId id type of connection
     * @return true or false - exist connection type or not
     */
    function isConnectionTypeExist(uint256 typeConnectionId)
        private
        view
        returns (bool)
    {
        for (uint256 i = 0; i < connectionsTypes.length; i++) {
            if (
                connectionsTypes[i].id == typeConnectionId &&
                !connectionsTypes[i].isDeleted
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @notice Checking for the existence of such a connection
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     * @return true or false - exist connection or not
     */
    function isConnectionExist(
        uint256 lifespanParentId,
        uint256 lifespanChildId
    ) private view returns (bool) {
        uint256[] memory idsByLifespan = connectionsById[lifespanParentId];

        for (uint256 i = 0; i < idsByLifespan.length; i++) {
            Connection memory parent = connections[idsByLifespan[i]];

            if (
                parent.lifespanChildId == lifespanChildId && !parent.isDeleted
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @notice Add new connection LifeSpan to DB
     * @param lifespanParentId id ERC721 parent token
     * @param lifespanChildId id ERC721 child token
     * @param typeConnectionId type of connection type
     * @param dateStart date when connection start
     * @param dateEnd date when connection end
     * @param isActive is active connection
     */
    function addConnectionToDB(
        uint256 lifespanParentId,
        uint256 lifespanChildId,
        uint256 typeConnectionId,
        uint256 dateStart,
        uint256 dateEnd,
        bool isActive
    ) private {
        Connection memory connection = Connection(
            lifespanParentId,
            lifespanChildId,
            typeConnectionId,
            dateStart,
            dateEnd,
            isActive,
            false
        );

        connections.push(connection);

        connectionsById[lifespanParentId].push(connections.length - 1);

        emit ConnectionAdded(
            msg.sender,
            lifespanParentId,
            lifespanChildId,
            typeConnectionId
        );
    }

    /**
     * @notice Get count of not deleted connections
     * @param connectionsParent array of ids connections
     * @return count of not deleted connections
     */
    function getCountNotDeletedConnections(uint256[] memory connectionsParent)
        private
        view
        returns (uint256)
    {
        uint256 count = 0;

        for (uint256 i = 0; i < connectionsParent.length; i++) {
            Connection memory connection = connections[connectionsParent[i]];

            if (!connection.isDeleted) {
                count++;
            }
        }

        return count;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}
}

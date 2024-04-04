// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TokenMaster is ERC721 {
    address public owner;
    uint256 public totalSupply; // Total nfts minted
    uint256 public totalOccasions;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    struct Occasion {
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
    }

    mapping(uint256 => Occasion) occasions;
    mapping(uint256 => mapping(uint256 => address)) public seatTaken; //assign the seat to the address
    mapping(uint256 => uint256[]) public seatsTaken;
    mapping(uint256 => mapping(address => bool)) public hasBought; //how many tickets does an address own

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can create Occasions");
        _;
    }

    function list(
        string memory _name,
        uint256 _cost,
        uint256 _maxTickets,
        string memory _date,
        string memory _time,
        string memory _location
    ) public onlyOwner {
        totalOccasions++;
        occasions[totalOccasions] = Occasion(
            totalOccasions,
            _name,
            _cost,
            _maxTickets,
            _maxTickets,
            _date,
            _time,
            _location
        );
    }

    function mint(uint256 _id, uint256 _seat) public payable {
        require(_id != 0, "Invalid Occasion ID");
        require(_id <= totalOccasions, "Invalid Occasion ID");
        //require that ETH sent is > cost
        require(msg.value >= occasions[_id].cost, "Insufficient funds");
        //require that seat isn't taken and exists
        require(_seat <= occasions[_id].maxTickets, "Invalid seat number");
        require(seatTaken[_id][_seat] == address(0), "Seat taken");

        //(which occasion, seat no.)
        totalSupply++;
        occasions[_id].tickets--;
        seatTaken[_id][_seat] = msg.sender; //assign the seat to the address
        seatsTaken[_id].push(_seat); //add the seat to the list of seats taken
        hasBought[_id][msg.sender] = true; //updating buying status
        _safeMint(msg.sender, totalSupply);
    }

    function getOccasion(uint256 _id) public view returns (Occasion memory) {
        return occasions[_id];
    }

    function getSeatsTaken(uint256 _id) public view returns (uint256[] memory) {
        return seatsTaken[_id];
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Failed to withdraw ether");
    }
}

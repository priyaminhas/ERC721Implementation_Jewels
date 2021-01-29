// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

import "./ERC721Standard.sol";

contract SparklesToken is ERC721Standard {

    address admin;
    uint256 public notSoldJewels;
    uint256 tokenId;
    mapping(uint256 => address) public idToOwner;
    
    struct Jewel{
        uint256 token_id;
        string name;
        string description;
        uint256 price;
        string date;
        address payable owner;
        string image_url;
        uint256 rarity;
        string location;
    }
    mapping(uint256 => Jewel) public jewels;

    constructor(string memory _name, string memory _symbol) ERC721Standard(_name,_symbol) {
        address payable owner = msg.sender;
        Jewel memory jewl = Jewel(tokenId,"Saphirre","Saphirre",100,"12-12-2020",owner,"http://google.com",100,"London");
        jewels[tokenId] = jewl;

        mint(owner, tokenId);
        idToOwner[tokenId] = owner;
        tokenId++;
    }

    function createToken(string memory _name,string memory _description,string memory _date,uint256 _price,string memory _image_url,uint256 _rarity,string memory _location,address payable _owner) external{
        require(bytes(_name).length > 0, 'The name cannot be empty');
        require(bytes(_description).length > 0, 'The description cannot be empty');
        require(bytes(_date).length > 0, 'The date cannot be empty');
        require(_price > 0 , 'The price cannot be zero');
        require(bytes(_image_url).length > 0, 'The image cannot be empty');
        require(_rarity > 0 , 'The rarity cannot be zero');
        require(bytes(_location).length > 0, 'The location cannot be empty');


        jewels[tokenId] = Jewel(tokenId, _name,_description,_price,_date, _owner, _image_url, _rarity, _location);
        safeMint(_owner, tokenId);
        uint _index = getTokenIndexByTokenID(tokenId);
        jewels[_index].token_id = _index;
        notSoldJewels++;
    }

    function buyToken(uint256 token_id) payable public{
        address payable owner = msg.sender;
        require(!_exists(token_id),"There is no such token");
        uint token_index = getTokenIndexByTokenID(token_id);
        Jewel memory jewl = jewels[token_index];
        require(msg.value >= jewl.price);
        require(msg.sender != owner);
            
        if (msg.value > jewl.price) {
            msg.sender.transfer(msg.value - jewl.price);
        }
        jewl.owner.transfer(jewl.price);
        transferFrom(jewl.owner, msg.sender, token_id);
        //jewl[token_id].owner = msg.sender;
        notSoldJewels--;
    }

}
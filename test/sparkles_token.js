const BigNumber = require("bignumber.js");
const truffleAssert = require("truffle-assertions");
const ERC721Contract = artifacts.require("ERC721Standard");
const SparklesToken = artifacts.require("SparklesToken");
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("ERC721Standard", function ( accounts ) {
  let token;
  const initialTokens = 4;
  
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  
  before(async () => {
    token = await ERC721Contract.deployed();
    for (let i = 0; i < 4; i++) {
      let tx = await token.mint(owner, i);
    }
  });

  it("should check balanceOf() of the address",async function(){
      const balance = await token.balanceOf.call(owner);
      let ownertx = await token.balanceOf.call(owner);
      assert(new BigNumber(ownertx).isEqualTo(new BigNumber(initialTokens)),"Initial supply is not correct");
  });

  it("should test ownerOf() function", async () => {
    const tokenId = 0;
    const addressExpected = owner;
    const ownerAddress = await token.ownerOf.call(tokenId);
    assert(ownerAddress === addressExpected, "This is not expected owner");
  });

  it("should test getApproved() function", async() => {
    const tokenId = 0;
    const addressExpected = "0x0000000000000000000000000000000000000000";
    let tx = await token.getApproved.call(tokenId);
    assert(tx === addressExpected, "This is not expected approving token Id");
  });


  it("should test setApprovalForAll() and also test isApprovedForAll() function", async () => {
    const receipt = await token.setApprovalForAll(owner, true, {
      from: user1,
    });
    truffleAssert.eventEmitted(receipt, "ApprovalForAll", (obj) => {
      return (
        obj._owner === user1 &&
        obj._operator === owner &&
        obj._approved === true
      );
    });
    const receipt2 = await token.isApprovedForAll.call(user1, owner);
    assert(receipt2 === true, "This is not expected output");
  });

  it("should test transferFrom() is able to transfer", async () => {
    const token_id = 0;
    const ownerBalanceBefore = await token.balanceOf.call(owner);
    const userBalanceBefore  = await token.balanceOf.call(user1);
   // console.log("ownerBalanceBefore:"+ownerBalanceBefore); 4
//console.log("userBalanceBefore:"+userBalanceBefore); 0
    const tokenReceipt = await token.transferFrom(owner,user1,token_id,{from:owner});

    const ownerBalanceAfter = await token.balanceOf.call(owner);
    const userBalanceAfter  = await token.balanceOf.call(user1);
   // console.log("ownerBalanceAfter:"+ownerBalanceAfter); 4
//console.log("userBalanceAfter:"+userBalanceAfter); 1
    const tokenOwner        = await token.ownerOf(token_id);
    
    assert(tokenOwner === user1, "This is not expected owner");

    assert(new BigNumber(ownerBalanceBefore).minus(new BigNumber(ownerBalanceAfter)).isEqualTo(new BigNumber(userBalanceAfter)),"The expected supply is not correct");

    truffleAssert.eventEmitted(tokenReceipt, "Transfer", (obj) => {
      return (obj._from === owner && obj._to === user1 && new BigNumber(obj._tokenId).isEqualTo(new BigNumber(token_id)));
    });

  });

  it("should test safetransferFrom()", async () => {
    const tokenId = 1;
    const ownerBalanceBefore = await token.balanceOf.call(owner);
    const userBalanceBefore  = await token.balanceOf.call(user1);
    const tokenReceipt = await token.transferFrom(owner, user1, tokenId, {
      from: owner,
    });

    const ownerBalanceAfter = await token.balanceOf.call(owner);
    const userBalanceAfter  = await token.balanceOf.call(user1);
    const tokenOwner        = await token.ownerOf(tokenId);

    assert(ownerBalanceAfter.toNumber() === 1 ,"This is not admin's supply");
    assert(tokenOwner === user1 ,"Not expected owner of token");

    truffleAssert.eventEmitted(receipt, "Transfer", (obj) => {
      return (obj._from === owner &&  obj._to === user1 && new BigNumber(obj._tokenId).isEqualTo(new BigNumber(tokenId))
      );
    });
  });

 
 
  // it("should test apporved() function",async()  => {
  //   const support = await token.supportsInterface
  //   const _INTERFACE_ID_ERC165 = '0x01ffc9a7';
  //   token.supportedInterfaces[_INTERFACE_ID_ERC165] = true;
  //   await token
  // });
});

contract("SparklesToken",function(accounts) {
  let jewelToken;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  const tokenName         = "Ruby";
  const tokenDescription  = "Ruby";
  const tokenPrice        =  new BigNumber(100);
  const tokenDate         =  "12-12-2020";
  const tokenImage_url    = 'http://test.com';
  const tokenRarity       = new BigNumber(90);
  const tokenLocation     = "London";

  before(async() => {
     jewelToken = await SparklesToken.deployed();
  });

  it("should check for the owner of the token", async () => {
    const tokenId = 0;
    const receipt = await jewelToken.idToOwner(tokenId);
    assert(receipt === owner,"The owner should be equal to msg.sender");
  });

  it("should be able to create a token", async () => {
    const token_id = 3;
    const sparklesReceipt = await jewelToken.createToken(tokenName,tokenDescription,tokenDate,tokenPrice,tokenImage_url,tokenRarity,tokenLocation,user2);
    
    const mintNew = await jewelToken.mint(user2,token_id);
    truffleAssert.eventEmitted(mintNew, "Transfer", (obj) => {
      return (
        obj._from === "0x0000000000000000000000000000000000000000" && obj._to === user2 && new BigNumber(obj._tokenId).isEqualTo(new BigNumber(token_id))
      );
    });

    assert(sparklesReceipt,tokenName,tokenDescription,tokenPrice,tokenDate,user2,tokenImage_url,tokenRarity,tokenLocation,"This is not expected information");

    const tokenOwner = await jewelToken.idToOwner(token_id);
    assert(tokenOwner === user2, "The owner of token does not match with one created");

  });
  
});

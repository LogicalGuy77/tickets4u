const { expect } = require("chai");

const NAME = "TokenMaster";
const SYMBOL = "TM";

const OCCASION_NAME = "Cipher Meetup";
const OCCASION_COST = ethers.utils.parseUnits("2", "ether");
const OCCASION_MAX_TICKETS = 322;
const OCCASION_DATE = "Apr 15";
const OCCASION_TIME = "10:00AM IST";
const OCCASION_LOCATION = "Jaipur, India";

describe("TokenMaster", () => {
  let tokenMaster;
  let deployer, buyer;
  beforeEach(async () => {
    //setup accounts
    [deployer, buyer] = await ethers.getSigners();
    const TokenMaster = await ethers.getContractFactory("TokenMaster");
    tokenMaster = await TokenMaster.deploy(NAME, SYMBOL);
    const transaction = await tokenMaster
      .connect(deployer)
      .list(
        OCCASION_NAME,
        OCCASION_COST,
        OCCASION_MAX_TICKETS,
        OCCASION_DATE,
        OCCASION_TIME,
        OCCASION_LOCATION
      );
    await transaction.wait();
  });

  describe("Deployment", () => {
    it("Should deploy the contract", async () => {
      expect(await tokenMaster.name()).to.equal(NAME);
    });

    it("Should set symbol", async () => {
      expect(await tokenMaster.symbol()).to.equal(SYMBOL);
    });

    it("Sets the owner", async () => {
      expect(await tokenMaster.owner()).to.equal(deployer.address);
    });
  });

  describe("Occasions", () => {
    it("Updates the occasions count", async () => {
      const totalOccasions = await tokenMaster.totalOccasions();
      expect(totalOccasions).to.equal(1);
    });

    it("Returns occasions attributes", async () => {
      const occasion = await tokenMaster.getOccasion(1);
      expect(occasion.id).to.be.equal(1);
      expect(occasion.name).to.be.equal(OCCASION_NAME);
      expect(occasion.cost).to.be.equal(OCCASION_COST);
      expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS);
      expect(occasion.date).to.be.equal(OCCASION_DATE);
      expect(occasion.time).to.be.equal(OCCASION_TIME);
      expect(occasion.location).to.be.equal(OCCASION_LOCATION);
    });
  });

  describe("Mining", () => {
    const ID = 1;
    const SEAT = 69;
    const AMOUNT = ethers.utils.parseUnits("2", "ether");

    beforeEach(async () => {
      const transaction = await tokenMaster
        .connect(buyer)
        .mint(ID, SEAT, { value: AMOUNT }); //value is meta data
      await transaction.wait();
    });

    it("Updates the tickets count", async () => {
      const occasion = await tokenMaster.getOccasion(ID);
      expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS - 1);
    });

    it("Updates buying status", async () => {
      const status = await tokenMaster.hasBought(ID, buyer.address);
      expect(status).to.be.equal(true);
    });

    it("Updates overall seating status", async () => {
      const seats = await tokenMaster.getSeatsTaken(ID);
      expect(seats.length).to.equal(1);
      expect(seats[0]).to.equal(SEAT);
    });

    it("Updates seat status", async () => {
      const owner = await tokenMaster.seatTaken(ID, SEAT);
      expect(owner).to.be.equal(buyer.address);
    });

    it("Updates the balance", async () => {
      const balance = await ethers.provider.getBalance(tokenMaster.address);
      expect(balance).to.be.equal(AMOUNT);
    });
  });

  describe("Withdrawing", () => {
    const ID = 1;
    const SEAT = 69;
    const AMOUNT = ethers.utils.parseUnits("2", "ether");
    let balanceBefore;

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      let transaction = await tokenMaster
        .connect(buyer)
        .mint(ID, SEAT, { value: AMOUNT });
      await transaction.wait();

      transaction = await tokenMaster.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the contract balance", async () => {
      const balance = await ethers.provider.getBalance(tokenMaster.address);
      expect(balance).to.equal(0);
    });
  });
});

const { expect } = require("chai");
const sinon = require("sinon");
const { processData } = require("../services/messageProcessor");

describe("processData", () => {
  let queryStub, eventCreateStub, cacheServiceStub;

  beforeEach(() => {
    queryStub = sinon.stub().resolves({ rows: [{ id: 1 }] });

    eventCreateStub = sinon.stub().resolves();

    cacheServiceStub = {
      invalidateEvent: sinon.stub().resolves(),
      cacheEvent: sinon.stub().resolves(),
      publishEvent: sinon.stub().resolves(),
    };
  });

  it("should save data and return the ID", async () => {
    const input = { title: "Test", description: "Sample" };

    const id = await processData(input, {
      query: queryStub,
      Event: { create: eventCreateStub },
      CacheService: cacheServiceStub,
    });

    expect(id).to.equal(1);
    expect(queryStub.calledOnce).to.be.true;
    expect(eventCreateStub.calledOnce).to.be.true;
    expect(cacheServiceStub.invalidateEvent.calledTwice).to.be.true;
    expect(cacheServiceStub.cacheEvent.calledOnce).to.be.true;
    expect(cacheServiceStub.publishEvent.calledOnce).to.be.true;
  });

  it("should throw if query fails", async () => {
    queryStub.rejects(new Error("Database error"));

    try {
      await processData({ title: "T", description: "D" }, {
        query: queryStub,
        Event: { create: eventCreateStub },
        CacheService: cacheServiceStub,
      });
      throw new Error("Should not reach here");
    } catch (err) {
      expect(err.message).to.equal("Database error");
    }
  });

  it("should throw if MongoDB save fails", async () => {
    eventCreateStub.rejects(new Error("MongoDB error"));

    try {
      await processData({ title: "T", description: "D" }, {
        query: queryStub,
        Event: { create: eventCreateStub },
        CacheService: cacheServiceStub,
      });
      throw new Error("Should not reach here");
    } catch (err) {
      expect(err.message).to.equal("MongoDB error");
    }
  });

  it("should throw if cacheEvent fails", async () => {
    cacheServiceStub.cacheEvent.rejects(new Error("Cache error"));

    try {
      await processData({ title: "T", description: "D" }, {
        query: queryStub,
        Event: { create: eventCreateStub },
        CacheService: cacheServiceStub,
      });
      throw new Error("Should not reach here");
    } catch (err) {
      expect(err.message).to.equal("Cache error");
    }
  });

  it("should throw if title is missing", async () => {
    try {
      await processData({ description: "no title" }, {
        query: queryStub,
        Event: { create: eventCreateStub },
        CacheService: cacheServiceStub,
      });
      throw new Error("Should not reach here");
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it("should throw if description is missing", async () => {
    try {
      await processData({ title: "no description" }, {
        query: queryStub,
        Event: { create: eventCreateStub },
        CacheService: cacheServiceStub,
      });
      throw new Error("Should not reach here");
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it("should throw if input is null", async () => {
    try {
      await processData(null, {
        query: queryStub,
        Event: { create: eventCreateStub },
        CacheService: cacheServiceStub,
      });
      throw new Error("Should not reach here");
    } catch (err) {
      expect(err).to.exist;
    }
  });
});

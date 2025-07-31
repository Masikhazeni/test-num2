const { expect } = require("chai");
const sinon = require("sinon");
const { processMessage } = require("../services/messageProcessor");

describe("processMessage - unit test", () => {
  let createStub, ackStub, nackStub, cacheEventStub, publishEventStub;
  let mockEvent, mockChannel, mockCacheService;

  beforeEach(() => {
    createStub = sinon.stub();
    ackStub = sinon.stub();
    nackStub = sinon.stub();
    cacheEventStub = sinon.stub();
    publishEventStub = sinon.stub();

    mockEvent = { create: createStub };
    mockChannel = { ack: ackStub, nack: nackStub };
    mockCacheService = { cacheEvent: cacheEventStub, publishEvent: publishEventStub };
  });

  it("processes message successfully and calls all dependencies", async () => {
    const fakeId = "mocked-id-123";
    createStub.resolves({ _id: fakeId });
    cacheEventStub.resolves();
    publishEventStub.resolves();

    const msg = {
      content: Buffer.from(
        JSON.stringify({
          temperature: 10,
          humidity: 20,
          user_id: "u1",
          device_id: "d1",
        })
      ),
    };

    await processMessage(msg, {
      Event: mockEvent,
      channel: mockChannel,
      cacheService: mockCacheService,
    });

    expect(createStub.calledOnce).to.be.true;
    expect(createStub.firstCall.args[0]).to.deep.include({
      temperature: 10,
      humidity: 20,
      user_id: "u1",
      device_id: "d1",
    });

    expect(ackStub.calledOnceWith(msg)).to.be.true;
    expect(cacheEventStub.calledOnceWith(fakeId)).to.be.true;
    expect(publishEventStub.calledOnce).to.be.true;
    expect(nackStub.notCalled).to.be.true;
  });

  it("nacks and throws if Event.create fails", async () => {
    createStub.rejects(new Error("Mongo error"));

    const msg = {
      content: Buffer.from(
        JSON.stringify({
          temperature: 10,
          humidity: 20,
          user_id: "u1",
          device_id: "d1",
        })
      ),
    };

    try {
      await processMessage(msg, {
        Event: mockEvent,
        channel: mockChannel,
        cacheService: mockCacheService,
      });
      throw new Error("Should not reach here");
    } catch (err) {
      expect(err.message).to.equal("Mongo error");
      expect(nackStub.calledOnceWith(msg, false, true)).to.be.true;
      expect(ackStub.notCalled).to.be.true;
    }
  });

  it("nacks and throws if JSON.parse fails", async () => {
    const msg = {
      content: Buffer.from("not json"),
    };

    try {
      await processMessage(msg, {
        Event: mockEvent,
        channel: mockChannel,
        cacheService: mockCacheService,
      });
      throw new Error("Should not reach here");
    } catch (err) {
      expect(err).to.exist;
      expect(nackStub.calledOnceWith(msg, false, true)).to.be.true;
      expect(ackStub.notCalled).to.be.true;
    }
  });
});

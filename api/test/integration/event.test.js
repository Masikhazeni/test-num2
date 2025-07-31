// const path = require("path");
// const dotenv = require("dotenv");
// dotenv.config({ path: path.join(__dirname, "../../.env.test") });

// const request = require("supertest");
// const { expect } = require("chai");

// const app = require("../../app");
// const { connectRedis, redisClient } = require("../../config/connectRedis");
// const connectMongo = require("../../config/connectMongo");
// const { connectPostgres, query } = require("../../config/connectPostgres");
// const { connectRabbit } = require("../../config/rabbitmq");
// const Event = require("../../models/eventModel");

// describe("Integration: Event API with Supertest", function () {
//   this.timeout(10000);

//   let createdPgId;

//   before(async () => {
//     await connectRedis();
//     await connectMongo();
//     await connectPostgres();
//     await connectRabbit();
//   });

//   afterEach(async () => {
//     await redisClient.flushAll();
//     await Event.deleteMany({});
//     await query("DELETE FROM events");
//   });

//   describe("POST /api/events", () => {
//     it("should add the event to RabbitMQ queue", async () => {
//       const res = await request(app).post("/api/events").send({
//         'temperture': 20,
//         'humidity': 30,
//         "user_id":1,
//         "device_id":1
//       });

//       expect(res.status).to.equal(202);
//       expect(res.body).to.have.property("status", "queued");
//     });

//     it("should not create event with empty input", async () => {
//       const res = await request(app).post("/api/events").send({});
//       expect(res.status).to.equal(400);
//       expect(res.body).to.have.property("errors");
//     });
//   });

//   describe("GET /api/events/:id", () => {
//     beforeEach(async () => {
//     await Event.findById(id);
//     });

//     it("should fetch event data MongoDB and cache in Redis", async () => {
//       const res = await request(app).get(`/api/events/${}`);
//       expect(res.status).to.equal(200);
//       expect(res.body.data).to.include.keys("id", "title", "description");
//       expect(res.body.data).to.have.property("mongo_id");
//       expect(res.body.message).to.include("saved from postgreSQL");

//       const cached = await redisClient.get(`event:${createdPgId}`);
//       expect(cached).to.be.a("string");
//     });

//     it("should retrieve data from Redis on subsequent requests", async () => {
//       await request(app).get(`/api/events/${createdPgId}`);
//       const res = await request(app).get(`/api/events/${createdPgId}`);
//       expect(res.body.message).to.include("Cache HIT");
//     });

//     it("should return 404 for non-existent event", async () => {
//       const res = await request(app).get("/api/events/999999");
//       expect(res.status).to.equal(404);
//     });
//   });
// });



const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env.test") });

const request = require("supertest");
const { expect } = require("chai");

const app = require("../../app");
const { connectRedis, redisClient } = require("../../config/connectRedis");
const connectMongo = require("../../config/connectMongo");
const { connectPostgres, query } = require("../../config/connectPostgres");
const { connectRabbit } = require("../../config/rabbitmq");
const Event = require("../../models/eventModel");

describe("Integration: Event API with Supertest", function () {
  this.timeout(15000);

  let validDeviceId;
  let validUserId;

  before(async () => {
    await connectRedis();
    await connectMongo();
    await connectPostgres();
    await connectRabbit();
// ساخت یوزر و دستگاه برای تست
    const res = await query(
      `INSERT INTO users(phone_number) VALUES($1) RETURNING id`,
      ["09123456789"]
    );
    validUserId = res.rows[0].id;

    const res2 = await query(
      `INSERT INTO devices(user_id, name) VALUES($1, 'Test Device') RETURNING id`,
      [validUserId]
    );
    validDeviceId = res2.rows[0].id;
  });

  afterEach(async () => {
    await redisClient.flushAll();
    await Event.deleteMany({});
  });

  after(async () => {
    await query("DELETE FROM devices");
    await query("DELETE FROM users");
  });

  describe("POST /api/events", () => {
    it("should enqueue event when device and user exist", async () => {
      const res = await request(app)
        .post("/api/events")
        .send({
          temperature: 20,
          humidity: 30,
          user_id: validUserId,
          device_id: validDeviceId,
        });

      expect(res.status).to.equal(202);
      expect(res.body).to.have.property("status", "queued");
      expect(res.body).to.have.property("message");
    });

    it("should fail if device does not belong to user", async () => {
      const res = await request(app)
        .post("/api/events")
        .send({
          temperature: 20,
          humidity: 30,
          user_id: validUserId,
          device_id: 9999999,
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("status", "error");
      expect(res.body.message).to.match(/No device found/);
    });

    it("should fail if input is empty", async () => {
      const res = await request(app).post("/api/events").send({});
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("errors");
    });
  });

  describe("GET /api/events/:id", () => {
    let mongoEvent;

    beforeEach(async () => {
      mongoEvent = await Event.create({
        temperature: 25,
        humidity: 40,
        user_id: validUserId,
        device_id: validDeviceId,
      });
    });

    it("should get event from MongoDB and cache it", async () => {
      const res = await request(app).get(`/api/events/${mongoEvent._id}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("success", true);
      expect(res.body.data).to.include({
        temperature: 25,
        humidity: 40,
        user_id: validUserId,
        device_id: validDeviceId,
      });

      const cached = await redisClient.get(`event:${mongoEvent._id.toString()}`);
      expect(cached).to.be.a("string");

      const parsedCached = JSON.parse(cached);
      expect(parsedCached).to.include({
        temperature: 25,
        humidity: 40,
        user_id: validUserId,
        device_id: validDeviceId,
      });
    });

    it("should get event from Redis cache on subsequent requests", async () => {
      await request(app).get(`/api/events/${mongoEvent._id}`);

      const res = await request(app).get(`/api/events/${mongoEvent._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.include("Cache HIT");
      expect(res.body.data).to.include({
        temperature: 25,
        humidity: 40,
        user_id: validUserId,
        device_id: validDeviceId,
      });
    });

    it("should return 404 for non-existent event", async () => {
      const fakeId = "6123456789abcdef01234567";

      const res = await request(app).get(`/api/events/${fakeId}`);
      expect(res.status).to.equal(404);
    });
  });
});

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

const request = require('supertest');
const { expect } = require('chai');

const app = require('../../app');
const { connectRedis, redisClient } = require('../../config/connectRedis');
const connectMongo = require('../../config/connectMongo');
const { connectPostgres, query } = require('../../config/connectPostgres');
const { connectRabbit } = require('../../config/rabbitmq');
const Event = require('../../models/eventModel');

describe('Integration: Event API with Supertest', function () {
  this.timeout(10000);

  let createdPgId;

  before(async () => {
    await connectRedis();
    await connectMongo();
    await connectPostgres();
    await connectRabbit();
  });

  afterEach(async () => {
    await redisClient.flushAll();
    await Event.deleteMany({});
    await query('DELETE FROM events');
  });

  describe('POST /api/events', () => {
    it('should add the event to RabbitMQ queue', async () => {
      const res = await request(app).post('/api/events').send({
        title: 'Test Event',
        description: 'Test description',
      });

      expect(res.status).to.equal(202);
      expect(res.body).to.have.property('status', 'queued');
    });

    it('should not create event with empty input', async () => {
      const res = await request(app).post('/api/events').send({});
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });
  });

  describe('GET /api/events/:id', () => {
    beforeEach(async () => {
      const pgRes = await query(
        'INSERT INTO events (title, description) VALUES ($1, $2) RETURNING *',
        ['Test Title', 'Test Description']
      );

      createdPgId = pgRes.rows[0].id;

      await Event.create({
        title: pgRes.rows[0].title,
        description: pgRes.rows[0].description,
        pg_id: createdPgId,
      });
    });

    it('should fetch event data from Postgres and MongoDB and cache in Redis', async () => {
      const res = await request(app).get(`/api/events/${createdPgId}`);
      expect(res.status).to.equal(200);
      expect(res.body.data).to.include.keys('id', 'title', 'description');
      expect(res.body.data).to.have.property('mongo_id');
      expect(res.body.message).to.include('saved from postgreSQL');

      const cached = await redisClient.get(`event:${createdPgId}`);
      expect(cached).to.be.a('string');
    });

    it('should retrieve data from Redis on subsequent requests', async () => {
      await request(app).get(`/api/events/${createdPgId}`);
      const res = await request(app).get(`/api/events/${createdPgId}`);
      expect(res.body.message).to.include('Cache HIT');
    });

    it('should return 404 for non-existent event', async () => {
      const res = await request(app).get('/api/events/999999');
      expect(res.status).to.equal(404);
    });
  });
});


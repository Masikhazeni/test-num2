const processData = async (data, { query, Event, CacheService }) => {
  if (!data.title || !data.description) {
    throw new Error("title and description are required");
  }

  const pgResult = await query(
    "INSERT INTO events(title, description) VALUES($1, $2) RETURNING id",
    [data.title, data.description]
  );

  const pgId = pgResult.rows[0].id;

  await Event.create({
    title: data.title,
    description: data.description,
    pg_id: pgId,
  });

  await CacheService.invalidateEvent("all");
  await CacheService.invalidateEvent(pgId);
  await CacheService.cacheEvent(pgId, {
    title: data.title,
    description: data.description,
    pg_id: pgId,
    timestamp: new Date(),
  });
  await CacheService.publishEvent({
    title: data.title,
    description: data.description,
    pg_id: pgId,
    timestamp: new Date(),
  });

  return pgId;
};

module.exports = { processData };

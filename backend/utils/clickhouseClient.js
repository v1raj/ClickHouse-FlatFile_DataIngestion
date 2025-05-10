const { createClient } = require('@clickhouse/client');



function getClickHouseClient(config) {
  const clickhouse = createClient({
    url:`http://localhost:${config.host}`, 
    username: config.username,
    password: config.password,
    database: config.db,
  });
  return clickhouse;
}

module.exports = { getClickHouseClient };
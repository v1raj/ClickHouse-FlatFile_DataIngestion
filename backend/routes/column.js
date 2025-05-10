// File: src/routes/column.js
const express = require('express');
const router = express.Router();
const { getClickHouseClient } = require('../utils/clickhouseClient');

// POST /column
// Body: { table: string, config: { host, username, password, database } }
router.post('/', async (req, res) => {
  const { table, config } = req.body;
  try {
    const client = getClickHouseClient(config);
    // describe table to get columns
    const colStream = await client.query({ query: `DESCRIBE TABLE \`${table}\``, format: 'JSON' });
    const colsJson = await colStream.json();
    const cols = colsJson.data.map(c => ({ name: c.name, type: c.type }));
    // count rows
    const rowStream = await client.query({ query: `SELECT count(*) AS count FROM \`${table}\``, format: 'JSON' });
    const rowsJson = await rowStream.json();
    const rowCount = rowsJson.data[0].count;
    res.json({ cols, rowCount });
  } catch (err) {
    console.error('Error in /column:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


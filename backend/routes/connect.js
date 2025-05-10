// File: src/routes/connect.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { getClickHouseClient } = require('../utils/clickhouseClient');
const upload = multer();

// POST /connect
// Body: { source: 'ClickHouse'|'FlatFile', config }
router.post('/', upload.none(), async (req, res) => {
  const { source, config } = req.body;
  if (source !== 'ClickHouse') {
    return res.status(400).json({ error: 'Unsupported source for connect' });
  }
  try {
    const client = getClickHouseClient(config);
    // retrieve tables
    const stream = await client.query({ query: 'SHOW TABLES', format: 'JSON' });
    const json = await stream.json();
    // JSON data: { data: [ { name: 'table1' }, ... ] }
    const tables = json.data.map(r => ({ name: r.name }));
    res.json({ tables });
  } catch (err) {
    console.error('Error in /connect:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

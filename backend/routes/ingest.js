// File: src/routes/ingest.js
const express = require('express');
const router = express.Router();
const { getClickHouseClient } = require('../utils/clickhouseClient');

// POST /ingest
// Body: { source, table, config, mapping: [{source,target}], data: Array<Object> }
router.post('/', async (req, res) => {
  const { source, table, config, mapping, data } = req.body;
  try {
    const client = getClickHouseClient(config);

    if (source === 'ClickHouse') {
      // fetch from CH
      const cols = mapping.map(m => `\`${m.source}\``).join(',');
      const stream = await client.query({
        query: `SELECT ${cols} FROM \`${table}\` LIMIT 10`,
        format: 'JSONEachRow'
      });
      const rows = await stream.json();
      return res.json({ ingested: rows.length, rows:rows });
    }

    if (source === 'FlatFile') {
      // prepare insert values based on mapping
      console.log('Preparing for ingestion...');
      const values = data.map(row => {
        const obj = {};
        mapping.forEach(m => {
          obj[m.target] = row[m.source];
        });
        return obj;
      });
      console.log(values);
      await client.insert({
        table,
        format: 'JSONEachRow',
        values
      });
      console.log('Ingestion completed.');
      console.log('Number of records ingested:', values.length);
      return res.json({ ingested: values.length });
    }

    res.status(400).json({ error: 'Unsupported source' });
  } catch (err) {
    console.error('Error in /ingest:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getClickHouseClient } = require('../utils/clickhouseClient');
const { parseCSV, writeCSV } = require('../utils/fileUtils');

router.post('/', async (req, res) => {
  const { source, config, table, columns, filePath, delimiter, batchSize = 1000, direction } = req.body;
  try {
    if (direction === 'toFlatFile') {
      const ch = getClickHouseClient(config);
      const rows = await ch.query(`SELECT ${columns.join(',')} FROM ${table}`).toPromise();
      await writeCSV(filePath, rows, columns);
      return res.json({ count: rows.length });
    }
    // FlatFile -> ClickHouse
    const ch = getClickHouseClient(config);
    const rows = await parseCSV(filePath, delimiter);
    const values = rows.map(r => columns.map(c => r[c]));
    for (let i = 0; i < values.length; i += batchSize) {
      await ch.insert(`INSERT INTO ${table} (${columns.join(',')}) VALUES`, values.slice(i, i + batchSize)).toPromise();
    }
    res.json({ count: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
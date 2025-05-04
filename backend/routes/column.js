const express = require('express');
const router = express.Router();
const { getClickHouseClient } = require('../utils/clickhouseClient');
const { parseCSV } = require('../utils/fileUtils');

router.post('/', async (req, res) => {
  const { source, config, table, filePath, delimiter } = req.body;
  try {
    if (source === 'ClickHouse') {
      const ch = getClickHouseClient(config);
      const desc = await ch.query(`DESCRIBE TABLE ${table}`).toPromise();
      return res.json({ columns: desc.map(c => c.name) });
    }
    const rows = await parseCSV(filePath, delimiter);
    res.json({ columns: rows.length ? Object.keys(rows[0]) : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
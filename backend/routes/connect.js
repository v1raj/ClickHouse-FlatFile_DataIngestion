const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csvParser = require('csv-parser');
const {Readable} = require('stream');
const { getClickHouseClient } = require('../utils/clickhouseClient');

const router = express.Router();
const upload = multer();

router.post('/', upload.single('file'),async (req, res) => {
  console.log('Received connection request');
  const source = req.body.source; 
  const config = req.body.config;
  
  console.log('Source:', source);
  console.log('Config:', config);
  try {
  

      console.log('Connecting to ClickHouse...');
      const config = req.body.config;
     
      const client = getClickHouseClient(config);

      console.log('Client created');

      const tablesStream = await client.query({
        query: 'SHOW TABLES',
        format: 'JSON'
      });

      console.log('Tables retrieved');
      const tables = await tablesStream.json(); 

      res.json({ tables }); 

    } 
  catch (err) {
   
    console.error('Error for real:', err.message);
    return res.status(500).json({ error: 'Failed to connect to the source. ' + err.message });
  }
});

module.exports = router;
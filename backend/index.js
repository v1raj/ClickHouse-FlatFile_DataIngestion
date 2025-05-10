const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const connectRouter = require('./routes/connect');
const columnRouter = require('./routes/column');
const ingestRouter = require('./routes/ingest');

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.use('/connect', connectRouter);
app.use('/column', columnRouter);
app.use('/ingest', ingestRouter);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
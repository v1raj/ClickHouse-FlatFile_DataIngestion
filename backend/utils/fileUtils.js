const fs = require('fs');
const csv = require('fast-csv');

function parseCSV(path, delimiter) {
  return new Promise((res, rej) => {
    const rows = [];
    fs.createReadStream(path)
      .pipe(csv.parse({ headers: true, delimiter }))
      .on('error', rej)
      .on('data', row => rows.push(row))
      .on('end', () => res(rows));
  });
}

function writeCSV(path, rows, headers) {
  return new Promise((res, rej) => {
    const ws = fs.createWriteStream(path);
    csv.write(rows, { headers }).pipe(ws).on('finish', res).on('error', rej);
  });
}

module.exports = { parseCSV, writeCSV };
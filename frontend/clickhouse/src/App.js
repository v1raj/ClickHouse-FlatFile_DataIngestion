import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

function App() {
  const [source, setSource] = useState('ClickHouse');
  const [target, setTarget] = useState('FlatFile');
  const [chConfig, setChConfig] = useState({ host: '', username: '', password: '', database: '' });
  const [delimiter, setDelimiter] = useState(',');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [status, setStatus] = useState('');
  const [recordCount, setRecordCount] = useState(null);
  const [clickHouseIngestedRecords, setClickHouseIngestedRecords] = useState([]);
  const [clickHouseColumns, setClickHouseColumns] = useState([]);
  const [fileColumns, setFileColumns] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [textTable, setTextTable] = useState('');

  const [columnMapping, setColumnMapping] = useState({});
  const [selectedMappings, setSelectedMappings] = useState([]);

  const [showCSVPreview, setShowCSVPreview] = useState(false);
  const [showLastIngested, setShowLastIngested] = useState(false);
  // Connect to CH
  const handleCHConnect = async () => {
    setStatus('Connecting to ClickHouse...');
    try {
      const res = await axios.post('http://localhost:5000/connect', {
        source: 'ClickHouse',
        config: chConfig
      });
      setTables(res.data.tables);
      
     
      setStatus('Connected. Tables loaded.');
    } catch {
      setStatus('Failed to connect.');
    }
  };

  // Load CH columns
  useEffect(() => {
    if (source === 'ClickHouse' && selectedTable) {
      axios
        .post('http://localhost:5000/column', {
          table: selectedTable,
          config:chConfig
        })
        .then(res => setClickHouseColumns(res.data.cols.map(c => c.name)))
        .catch(() => setStatus('Failed to fetch columns.'));
    }
  }, [selectedTable, source]);

  // CSV upload
  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split('\n');
    setCsvData(lines);
    setTextTable(lines.join('\n'));
    setFileColumns(lines[0].split(delimiter).map(h => h.trim()));
    setColumnMapping({});
    setSelectedMappings([]);
  };

  const toggleMapping = col =>
    setSelectedMappings(prev => (prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]));

  const handleMappingChange = (src, tgt) =>
    setColumnMapping(prev => ({ ...prev, [src]: tgt }));

  //add to csv file and show on text table
  const appendToCSV = (existingCSV, selectedColumns, newData) => {
    if (!existingCSV || existingCSV.length === 0) return;
    const header = existingCSV[0];
    const allCols = header.split(',');

    // Generate new rows safe‑guard newData
    const newRows = Array.isArray(newData)
      ? newData.map(row =>
          allCols.map(col => (selectedColumns.includes(col) ? (row[col] ?? '') : '')).join(',')
        )
      : [];

    const finalCSV = [...existingCSV, ...newRows];
    setCsvData(finalCSV);
    setTextTable(finalCSV.join('\n'));
  };
  //handle ingestion
  const handleIngestion = async () => {
    const mappingList = selectedMappings
      .filter(src => columnMapping[src])
      .map(src => ({ source: src, target: columnMapping[src] }));  
    let data = [];
    if (source === 'FlatFile') {
      console.log(`CSV Data length: ${csvData.length}`);
      console.log(`CSV Data: ${csvData[0]}`);

      const headerLine = csvData[0];
      const headers = headerLine.split(delimiter).map(h => h.trim());

     data = csvData
  .slice(1)                // drop header
  .filter(line => line)    // drop empty lines
  .map(line => {
    const values = line.split(delimiter);
    const obj = {};
    headers.forEach((h,i) => {
      obj[h] = values[i]?.trim() ?? '';
    });
    return obj;
  });



      const values = data.map(row => {
        const obj = {};
        mappingList.forEach(m => {
          obj[m.target] = row[m.source];
        });
        return obj;
      });

      console.log(`Data length: ${data.length}`);
      setClickHouseIngestedRecords(values);
    }
    
    const res = await axios.post('http://localhost:5000/ingest', {
      source:source,
      table: selectedTable,
      config: chConfig,
      mapping: mappingList,
      data : data
    });
    
    console.log(res.data.rows);
    setRecordCount(res.data.ingested);
    setStatus(res.data.ingested >= 0 ? 'Ingestion successful!' : 'Ingestion error');
    appendToCSV(csvData,selectedMappings,res.data.rows);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1>ClickHouse ↔ Flat File Ingestion</h1>
      <h2 style={{ color: '#00C4B4' }}>Status: {status}</h2>
      {recordCount !== null && <h2 style={{ color: '#00C4B4' }}>Records Ingested: {recordCount}</h2>}
      <div>
        <h3 style={{ color: '#517DF6' }}>Source:
        <select
          value={source}
          onChange={e => {
            const v = e.target.value;
            setSource(v);
            setTarget(v === 'ClickHouse' ? 'FlatFile' : 'ClickHouse');
            setColumnMapping({});
            setSelectedMappings([]);
          }}
        >
          <option>ClickHouse</option>
          <option>FlatFile</option>
        </select>
        </h3>

        <h3 style={{ color: '#517DF6' }}>Target:
        <select value={target} disabled>
          <option>{target}</option>
        </select>
        </h3>
        <div>
          <p></p>
        </div>
        <div>
          <p></p>
        </div>
        
      </div>

      
        <div>
          <h3 style={{ color: '#A259FF' }}>Enter ClickHouse connection details:  {['host', 'username', 'password', 'database'].map(f => (
            <input
              key={f}
              placeholder={f}
              onChange={e => setChConfig(c => ({ ...c, [f]: e.target.value }))}
            />
          ))}
          <button onClick={handleCHConnect}>Connect</button>
          </h3>
          
          

          <div>
          <h3 style={{ color: '#A259FF' }}>Choose Flat File: <input type="file" onChange={handleFileChange} />
          <input value={delimiter} onChange={e => setDelimiter(e.target.value)} placeholder="Delimiter" />
          </h3>
        </div>
      
      <div>
        <h3 style={{ color: '#A259FF' }}>Choose table: {tables.length > 0 && (
            <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
              <option value="">Select Table</option>
              {tables.map(t => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          )}</h3>
        </div>
        </div>

        <div>
        <h3 style={{ color: '#FF7EB9' }}>CSV Preview:<button onClick={() => setShowCSVPreview(prev => !prev)} className="mt-4 px-3 py-1 bg-gray-200 rounded">
  {showCSVPreview ? 'Hide CSV Preview' : 'Show CSV Preview'}
</button>
</h3>
{showCSVPreview && textTable && (
  <div className="mt-2">
    <pre style={{ whiteSpace: 'pre-wrap' }}>{textTable}</pre>
  </div>
)}
      </div>
      
<div>
<h3 style={{ color: '#FF7EB9' }}>Last ingested records into clickhouse: <button onClick={() => setShowLastIngested(prev => !prev)} className="mt-4 px-3 py-1 bg-gray-200 rounded">
  {showLastIngested ? 'Hide Last Ingested' : 'Show Last Ingested'}
</button>
</h3>
      {showLastIngested&&source === 'FlatFile'
      &&
      <div>
        <pre>{JSON.stringify(clickHouseIngestedRecords, null, 2)}</pre>
      </div>
      }
</div>
      
        

      {(source === 'ClickHouse' ? clickHouseColumns : fileColumns).length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Source Column</th>
              <th>Target Column</th>
              <th><button onClick={handleIngestion}>Start Ingestion</button></th>
            </tr>
            
          </thead>
          <tbody>
            {(source === 'ClickHouse' ? clickHouseColumns : fileColumns).map(col => (
              <tr key={col}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedMappings.includes(col)}
                    onChange={() => toggleMapping(col)}
                  />
                </td>
                <td>{col}</td>
                <td>
                  <select value={columnMapping[col] || ''} onChange={e => handleMappingChange(col, e.target.value)}>
                    <option value="">-- Select --</option>
                    {(source === 'ClickHouse' ? fileColumns : clickHouseColumns).map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      

     
      
    </div>
  );
}

export default App;

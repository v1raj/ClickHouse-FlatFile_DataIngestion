// File: src/App.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
function App() {
  const [source, setSource] = useState('ClickHouse');
  const [target, setTarget] = useState('FlatFile');
  const [chConfig, setChConfig] = useState({ host: '', username: '',password:'',database:''});
  const [file, setFile] = useState(null);
  const [delimiter, setDelimiter] = useState(',');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [status, setStatus] = useState('');
  const [recordCount, setRecordCount] = useState(null);
  const [content, setContent] = useState('');
  const [fileColumns, setFileColumns] = useState([]);
  const [selectedFileColumns, setSelectedFileColumns] = useState([]);
  const [textTable, setTextTable] = useState('');
  const [csvData, setCsvData] = useState([]);
  
  
  
  const handleCHConnect = async () => {
    setStatus('Connecting to ClickHouse...');
    
      let requestBody= {};
      
      requestBody = {
        source: source, // or 'FlatFile'
        config: chConfig
      };
      try{
      const res = await axios.post('http://localhost:5000/connect', requestBody
        , {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(res.data);
      setTables(res.data);
      setStatus('Connected. Tables loaded.');
      }
    catch(err){
      setStatus('Failed to connect to ClickHouse.');
      console.log(err);
    }
  
    
  
    };
   
    const handleFileColumns =() => {
return(
<div>
  <h3>Select Columns:</h3>
  {fileColumns.map((name, index) => (
    <label key={index} style={{ display: 'block', marginBottom: '4px' }}>
      <input
        type="checkbox"
        value={name}
        checked={selectedFileColumns.includes(name)}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedFileColumns(prev =>
            prev.includes(value)
              ? prev.filter(col => col !== value)
              : [...prev, value]
          );
        }}
      />
      {name}
    </label>
  ))}
</div>
);

    }


  const handleIngestion = async () => {
    
  };
  const renderTables = () => {
    const tableNames = tables.tables?.data?.map((table)=>table.name);
     console.log(tableNames);
     return(
      <div>
    <li>{tableNames}</li>
  </div>
     );
    }

  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return setTextTable('');

 
    const csv = await file.text();
    setCsvData(csv);
    const lines = csv.trim().split('\n').map(l => l.split(','));

    if (lines.length === 0) {
      setTextTable('Empty CSV');
      return;
    }

    setFileColumns(lines[0].map(col => col.trim()));
    const colCount = lines[0].length;
    const colWidths = Array(colCount).fill(0);
    lines.forEach(row => {
      row.forEach((cell, i) => {
        colWidths[i] = Math.max(colWidths[i], cell.length);
      });
    });


    const padded = lines.map(row =>
      row.map((cell, i) => cell.padEnd(colWidths[i], ' '))
         .join('   ')       
    );
    setTextTable(padded.join('\n'));
  };

 

  return (
  

    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">ClickHouse ↔ Flat File Ingestion</h1>

      <div className="flex gap-4 mb-4">
        <div>
        <label>Source:</label>
  <select value={source} onChange={e => {
    const selected = e.target.value;
    setSource(selected);
    setTarget(selected === 'ClickHouse' ? 'FlatFile' : 'ClickHouse'); // auto-set target
  }}>
    <option value="ClickHouse">ClickHouse</option>
    <option value="FlatFile">FlatFile</option>
  </select>
</div>

<div>
  <label>Target:</label>
  <select value={target} onChange={e => setTarget(e.target.value)} disabled>
    <option value={source === 'ClickHouse' ? 'FlatFile' : 'ClickHouse'}>
      {source === 'ClickHouse' ? 'FlatFile' : 'ClickHouse'}
    </option>
  </select>
        </div>
        
      </div>

      {source === 'ClickHouse' && (
        <div className="space-y-2 mb-4">
          <input placeholder="Host" onChange={e => setChConfig({ ...chConfig, host: e.target.value })} />
          <input placeholder="Username" onChange={e => setChConfig({ ...chConfig, username:e.target.value })} />
          <input placeholder="Password" onChange={e => setChConfig({ ...chConfig, password: e.target.value })} />
          <input placeholder="Database" onChange={e => setChConfig({ ...chConfig, database: e.target.value })} />
          <button onClick={handleCHConnect}>Connect</button>
        </div>
      )}
      

 
   
  


   <div>
      <h2>ClickHouse Tables</h2>
      <div>{status}</div>
      <div>
        {renderTables()}
      </div>
    </div>


          
       

      {source === 'FlatFile' && (
        <div className="mb-4">
          <input type="file" onChange={handleFileChange} />
          <input placeholder="Delimiter" value={delimiter} onChange={e => setDelimiter(e.target.value)} />
         
</div>
      )}

      {textTable.length>0 &&(
         
       <pre style={{ whiteSpace: 'pre', marginTop: 10 }}>
        <h2>Flat file table:</h2>
        
        {textTable}</pre>
       
      
      )}
      
   <div>
      <div>
        {handleFileColumns()}
      </div>
    </div>
      


       

      <button onClick={handleIngestion}>Start Ingestion</button>

      <div className="mt-4">
        <p>Status: {status}</p>
        {recordCount !== null && <p>Records Ingested: {recordCount}</p>}
      </div>
    </div>
    


    

    
      



  );
}

export default App;
# ClickHouse ↔ Flat File Data Ingestion Tool

This is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application that enables bi-directional data ingestion between **ClickHouse databases** and **flat files (CSV)**. Users can upload files, preview data, select columns, and ingest data into ClickHouse interactively.

---

## 🌐 Features

- Upload and preview CSV files with delimiter selection.
- Connect to ClickHouse and retrieve available tables.
- Display column names from both sources with checkboxes for selection.
- Ingest only selected columns from source to target.
- JWT-based user authentication (if implemented).
- Full UI in React, backend in Node/Express.

---

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: ClickHouse (Dockerized)
- **File Handling**: Multer
- **CSV Parsing**: Built-in or `csv-parser`
- **API Client**: Axios

---

## ⚙️ Setup Instructions

## 1.Clone the repository

```bash
git clone https://github.com/v1raj/ClickHouse-FlatFile_DataIngestion.git
cd ClickHouse-FlatFile_DataIngestion

## 2.Backend
Make sure node js is installed
cd backend
npm init - y
npm run dev

## 3.Frontend
Make sure react js is intialized
cd frontend
cd clickhouse
npm start


## Instruction for using clickhouse database in the application:
    Host field : http://localhost:8123,
    Username field: myuser,
    Password field: mypassword,
    Database field: mydb

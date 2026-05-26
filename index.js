require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// env
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false // Позволяет подключаться к Aiven без файла ca.pem
  }
});

const tables = ['users', 'properties', 'roomtypes', 'rooms', 'availability', 'bookings'];

tables.forEach(table => {
    app.get(`/api/${table}`, (req, res) => {
        let sql = `SELECT * FROM ${table}`;
        const today = new Date().toISOString().split('T')[0];

        // rooms status autoupdate
        if (table === 'rooms') {
            sql = `
                SELECT 
                    r.id, 
                    r.property_id,
                    r.roomnumber, 
                    rt.title as type,
                    CASE 
                        WHEN r.status = 'Maintenance' THEN 'Maintenance'
                        WHEN b.id IS NOT NULL THEN 'Occupied'
                        ELSE 'Available'
                    END AS status
                FROM rooms r
                LEFT JOIN roomtypes rt ON r.roomtype_id = rt.id
                LEFT JOIN bookings b ON r.id = b.room_id 
                    AND '${today}' BETWEEN b.checkindate AND b.checkoutdate
                    AND b.status != 'Cancelled'
            `;
        }

        db.query(sql, (err, results) => {
            if (err) {
                console.error(`Ошибка в таблице ${table}:`, err);
                return res.status(500).json(err);
            }
            res.json(results);
        });
    });
});

app.post('/api/upsert/:table', (req, res) => {
    const table = req.params.table;
    const data = req.body;
    
    if (!data.id || data.id === '') {
        delete data.id;
    }

    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const placeholders = keys.map(() => '?').join(', ');
    
    const updateChain = keys
        .filter(key => key !== 'id')
        .map(key => `${key} = new_data.${key}`)
        .join(', ');

    const sql = `
        INSERT INTO ${table} (${keys.join(', ')}) 
        VALUES (${placeholders}) 
        AS new_data
        ON DUPLICATE KEY UPDATE ${updateChain}
    `;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Ошибка базы данных");
        }
        res.redirect('/#' + table); 
    });
});

// 0<->1 availability
app.post('/api/availability/toggle/:id', (req, res) => {
    const id = req.params.id;
    const sql = "UPDATE availability SET isbooked = NOT isbooked WHERE id = ?";
    
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

module.exports = app;

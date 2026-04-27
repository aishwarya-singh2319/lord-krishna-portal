const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/students', require('./routes/students'));
app.use('/api/fees',     require('./routes/fees'));

app.get('/', (req, res) => res.json({ message: 'Lord Krishna School API running ✅' }));

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
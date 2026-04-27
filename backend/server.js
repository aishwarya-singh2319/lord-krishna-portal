const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/students', require('./routes/students'));
app.use('/api/fees',     require('./routes/fees'));
app.use('/api/results', require('./routes/results'));

app.get('/', (req, res) => res.json({ message: 'Lord Krishna School API running ✅' }));

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
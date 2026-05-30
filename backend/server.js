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
// Users with roles
const USERS = [
  { username: 'akshchaudhary', password: 'merimummy@2001', role: 'superadmin', name: 'Aksh Chaudhary' },
  { username: 'manavyadav',     password: 'manav@123',  role: 'subadmin',   name: 'Manav Yadav' },
  { username: 'teacher1',     password: 'teacher@123',  role: 'subadmin',   name: 'Teacher 1' },
];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, token: `lk-token-${user.role}-2024`, role: user.role, name: user.name });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

app.post('/api/change-password', (req, res) => {
  const { adminToken, targetUsername, newPassword } = req.body;
  if (adminToken !== 'lk-token-superadmin-2024')
    return res.status(403).json({ error: 'Only main admin can change passwords' });
  const user = USERS.find(u => u.username === targetUsername);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.password = newPassword;
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
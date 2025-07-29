const express = require('express');
const fs = require('fs');
const yaml = require('js-yaml');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Load users from YAML
function loadUsers() {
  return yaml.load(fs.readFileSync('users.yaml', 'utf8'));
}

// Save users to YAML
function saveUsers(data) {
  fs.writeFileSync('users.yaml', yaml.dump(data), 'utf8');
}

// Get all users (for login)
app.get('/users', (req, res) => {
  const users = loadUsers();
  res.json(users);
});

// Create a new user
app.post('/create-user', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const usersData = loadUsers();
  if (usersData.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  usersData.users.push({ username, password });
  saveUsers(usersData);
  res.json({ message: 'User created successfully' });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const usersData = loadUsers();

  const user = usersData.users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_DB_PATH = path.join(__dirname, 'data', 'users.json');

function readUsers() {
	if (!fs.existsSync(USERS_DB_PATH)) {
		return [];
	}
	try {
		const raw = fs.readFileSync(USERS_DB_PATH, 'utf-8');
		return JSON.parse(raw);
	} catch (err) {
		console.error('Failed to read users DB:', err);
		return [];
	}
}

function writeUsers(users) {
	fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'dev-secret',
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 1000 * 60 * 60 * 8 },
	})
);

function requireAuth(req, res, next) {
	if (req.session && req.session.userId) {
		return next();
	}
	res.redirect('/login');
}

app.use((req, res, next) => {
	res.locals.currentUser = null;
	if (req.session && req.session.userId) {
		const users = readUsers();
		const user = users.find(u => u.id === req.session.userId);
		if (user) {
			res.locals.currentUser = { id: user.id, email: user.email };
		}
	}
	next();
});

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/register', (req, res) => {
	res.render('register', { error: null, values: { email: '' } });
});

app.post('/register', async (req, res) => {
	const { email, password, confirmPassword } = req.body;
	const values = { email };
	if (!email || !password || !confirmPassword) {
		return res.status(400).render('register', { error: 'All fields are required.', values });
	}
	if (password !== confirmPassword) {
		return res.status(400).render('register', { error: 'Passwords do not match.', values });
	}
	const users = readUsers();
	const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
	if (existing) {
		return res.status(409).render('register', { error: 'Email already registered.', values });
	}
	const passwordHash = await bcrypt.hash(password, 10);
	const user = { id: uuidv4(), email, passwordHash, createdAt: new Date().toISOString() };
	users.push(user);
	writeUsers(users);
	req.session.userId = user.id;
	res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
	res.render('login', { error: null, values: { email: '' } });
});

app.post('/login', async (req, res) => {
	const { email, password } = req.body;
	const values = { email };
	if (!email || !password) {
		return res.status(400).render('login', { error: 'Email and password are required.', values });
	}
	const users = readUsers();
	const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
	if (!user) {
		return res.status(401).render('login', { error: 'Invalid credentials.', values });
	}
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) {
		return res.status(401).render('login', { error: 'Invalid credentials.', values });
	}
	req.session.userId = user.id;
	res.redirect('/dashboard');
});

app.post('/logout', (req, res) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
});

app.get('/dashboard', requireAuth, (req, res) => {
	const users = readUsers();
	const user = users.find(u => u.id === req.session.userId);
	res.render('dashboard', { user });
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
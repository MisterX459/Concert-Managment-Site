var express = require('express');
var router = express.Router();
var db = require('../database.js');

// encryption func that reverses the password
function reversePassword(pw) {
    return pw.split('').reverse().join('');
}

// ---------------------- REGISTRATION ----------------------

// GET /auth/register - Show the registration form
router.get('/register', (req, res) => {
    res.render('register');
});

// POST /auth/register - Handle the form submission
router.post('/register', (req, res) => {
    let { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }
    let reversed = reversePassword(password);
    db.run(
        `INSERT INTO Users (username, password) VALUES (?, ?)`,
        [username, reversed],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(400).send('Unable to register (username might be taken).');
            }
            res.redirect('/auth/login');
        }
    );
});

// ---------------------- LOGIN ----------------------

// GET /auth/login - Show the login form
router.get('/login', (req, res) => {
    res.render('login');
});

// POST /auth/login - Handle login
router.post('/login', (req, res) => {
    let { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }
    let reversed = reversePassword(password);

    // Check if user exists with these credentials
    db.get(
        `SELECT id FROM Users WHERE username=? AND password=?`,
        [username, reversed],
        (err, row) => {
            if (err) return res.status(500).send('Server error');
            if (!row) return res.status(401).send('Invalid username or password');

            // Set the userId cookie
            res.cookie('userId', row.id, { httpOnly: true });
            res.redirect('/');
        }
    );
});

module.exports = router;

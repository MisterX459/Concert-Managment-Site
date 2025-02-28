var express = require('express');
var router = express.Router();
var db = require('../database');

// List all concerts
router.get('/', (req, res) => {
    db.all(`SELECT id, name, event_date, location, capacity FROM Concerts`, [], (err, rows) => {
        if (err) return res.status(500).send('Error retrieving concerts.');
        res.render('concertsList', { concerts: rows });
    });
});

// Show form for adding a concert
router.get('/add', (req, res) => {
    res.render('concertAdd');
});

// Process adding a new concert
router.post('/add', (req, res) => {
    let { name, event_date, location, capacity } = req.body;

    //server-side validation
    if (!name || !event_date || !location || !capacity) {
        return res.status(400).send('All concert fields are required.');
    }

    db.run(
        `INSERT INTO Concerts (name, event_date, location, capacity) VALUES (?, ?, ?, ?)`,
        [name, event_date, location, capacity],
        function (err) {
            if (err) return res.status(500).send('Error inserting new concert.');
            res.redirect('/concerts');
        }
    );
});

// form to edit a concert
router.get('/:id/edit', (req, res) => {
    let concertId = req.params.id;
    db.get(`SELECT * FROM Concerts WHERE id = ?`, [concertId], (err, row) => {
        if (err || !row) return res.status(404).send('Concert not found.');
        res.render('concertEdit', { concert: row });
    });
});

// Process updating a concert
router.post('/:id/edit', (req, res) => {
    let concertId = req.params.id;
    let { name, event_date, location, capacity } = req.body;

    if (!name || !event_date || !location || !capacity) {
        return res.status(400).send('All fields are required.');
    }

    db.run(
        `UPDATE Concerts SET name=?, event_date=?, location=?, capacity=? WHERE id=?`,
        [name, event_date, location, capacity, concertId],
        function (err) {
            if (err) return res.status(500).send('Error updating concert.');
            res.redirect('/concerts');
        }
    );
});

// Show confirmation to delete a concert
router.get('/:id/delete', (req, res) => {
    let concertId = req.params.id;
    db.get(`SELECT * FROM Concerts WHERE id=?`, [concertId], (err, row) => {
        if (err || !row) return res.status(404).send('Concert not found.');
        res.render('concertDelete', { concert: row });
    });
});

// Process deleting a concert
router.post('/:id/delete', (req, res) => {
   let concertId = req.params.id;
    db.run(`DELETE FROM Concerts WHERE id=?`, [concertId], function (err) {
        if (err) return res.status(500).send('Error deleting concert.');
        res.redirect('/concerts');
    });
});

// Detailed view: show a single concert + which performers are playing
router.get('/:id', (req, res) => {
    let concertId = req.params.id;
    db.get(`SELECT * FROM Concerts WHERE id=?`, [concertId], (err, concert) => {
        if (err || !concert) return res.status(404).send('Concert not found.');

        // find all performers from ConcertPerformers table
        const query = `
      SELECT p.id, p.performer_name, p.genre, p.year_started, cp.stage_time
      FROM Performers p
      JOIN ConcertPerformers cp ON p.id = cp.performer_id
      WHERE cp.concert_id = ?
    `;
        db.all(query, [concertId], (err2, performers) => {
            if (err2) return res.status(500).send('Error loading performers.');
            res.render('concertDetail', { concert, performers });
        });
    });
});

module.exports = router;

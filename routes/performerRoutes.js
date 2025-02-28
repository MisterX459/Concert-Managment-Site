var express = require('express');
var router = express.Router();
var db = require('../database');

// List all performers
router.get('/', (req, res) => {
    db.all(`SELECT id, performer_name, genre, year_started FROM Performers`, [], (err, rows) => {
        if (err) return res.status(500).send('Error retrieving performers.');
        res.render('performerList', { performers: rows });
    });
});

// Show form for adding a performer
router.get('/add', (req, res) => {
    res.render('performerAdd');
});

// Process adding a new performer
router.post('/add', (req, res) => {
    let { performer_name, genre, year_started } = req.body;
    if (!performer_name || !genre || !year_started) {
        return res.status(400).send('All fields are required.');
    }

    db.run(
        `INSERT INTO Performers (performer_name, genre, year_started) VALUES (?, ?, ?)`,
        [performer_name, genre, year_started],
        function (err) {
            if (err) return res.status(500).send('Error inserting performer.');
            res.redirect('/performers');
        }
    );
});

// Show form to edit
router.get('/:id/edit', (req, res) => {
    let performerId = req.params.id;
    db.get(`SELECT * FROM Performers WHERE id=?`, [performerId], (err, row) => {
        if (err || !row) return res.status(404).send('Performer not found.');
        res.render('performerEdit', { performer: row });
    });
});

// Process edit
router.post('/:id/edit', (req, res) => {
    let performerId = req.params.id;
    let { performer_name, genre, year_started } = req.body;
    if (!performer_name || !genre || !year_started) {
        return res.status(400).send('All fields are required.');
    }
    db.run(
        `UPDATE Performers SET performer_name=?, genre=?, year_started=? WHERE id=?`,
        [performer_name, genre, year_started, performerId],
        function (err) {
            if (err) return res.status(500).send('Error updating performer.');
            res.redirect('/performers');
        }
    );
});

// Delete confirmation
router.get('/:id/delete', (req, res) => {
    let performerId = req.params.id;
    db.get(`SELECT * FROM Performers WHERE id=?`, [performerId], (err, row) => {
        if (err || !row) return res.status(404).send('Performer not found.');
        res.render('performerDelete', { performer: row });
    });
});

// Process delete
router.post('/:id/delete', (req, res) => {
    let performerId = req.params.id;
    db.run(`DELETE FROM Performers WHERE id=?`, [performerId], function (err) {
        if (err) return res.status(500).send('Error deleting performer.');
        res.redirect('/performers');
    });
});

module.exports = router;

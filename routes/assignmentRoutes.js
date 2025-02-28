var express = require('express');
var router = express.Router();
var db = require('../database');

// Show form to assign performer -> concert
router.get('/add', (req, res) => {
    db.all(`SELECT id, name FROM Concerts`, [], (err, concerts) => {
        if (err) return res.status(500).send('Error retrieving concerts.');
        db.all(`SELECT id, performer_name FROM Performers`, [], (err2, performers) => {
            if (err2) return res.status(500).send('Error retrieving performers.');
            res.render('assignmentAdd', { concerts, performers });
        });
    });
});


router.post('/add', (req, res) => {
    const { concert_id, performer_id, stage_time } = req.body;
    if (!concert_id || !performer_id || !stage_time) {
        return res.status(400).send('All fields are required.');
    }

    db.run(
        `INSERT INTO ConcertPerformers (concert_id, performer_id, stage_time)
     VALUES (?, ?, ?)`,
        [concert_id, performer_id, stage_time],
        function (err) {
            if (err) return res.status(500).send('Error assigning performer to concert.');
            res.redirect('/concerts');
        }
    );
});

module.exports = router;

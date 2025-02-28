const sqlite3 = require('sqlite3').verbose();
const DB_FILE = './concertDB.sqlite';

const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
    } else {
        console.log('Connected to the SQLite database:', DB_FILE);
        console.log('Go to localhost:3000/auth/register to enter a site');
        initializeTables();
        insertSampleData();
    }
});
function initializeTables() {
    //Concerts tab
    db.run(`
    CREATE TABLE IF NOT EXISTS Concerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      event_date DATE NOT NULL,
      location TEXT NOT NULL,
      capacity INTEGER NOT NULL
    )
  `);
    //Performers table
    db.run(`
    CREATE TABLE IF NOT EXISTS Performers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      performer_name TEXT NOT NULL,
      genre TEXT NOT NULL,
      year_started INTEGER NOT NULL
    )
  `);
    //ConcertPerformers table (many-to-many)
    db.run(`
    CREATE TABLE IF NOT EXISTS ConcertPerformers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concert_id INTEGER NOT NULL,
      performer_id INTEGER NOT NULL,
      stage_time TEXT NOT NULL,
      FOREIGN KEY (concert_id) REFERENCES Concerts(id) ON DELETE CASCADE,
      FOREIGN KEY (performer_id) REFERENCES Performers(id) ON DELETE CASCADE
    )
  `);
    //Users table to store user info
    db.run(`
    CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

}

function insertSampleData() {
    db.get(`SELECT COUNT(*) AS count FROM Concerts`, (err, row) => {
        if (row.count === 0) {
            console.log('Inserting sample concerts...');
            var insertion = db.prepare(`
        INSERT INTO Concerts (name, event_date, location, capacity)
        VALUES (?, ?, ?, ?)
      `);
            insertion.run('Rock Concert', '2025-05-15', 'Madison Square Garden', 20000);
            insertion.run('Jazz Night', '2026-09-10', 'Blue Note NYC', 300);
            insertion.run('Pop Fest', '2027-01-20', 'Staples Center', 25000);
            insertion.finalize();
        }
    });
    db.get(`SELECT COUNT(*) AS count FROM Performers`, (err, row) => {
        if (row.count === 0) {
            console.log('Inserting sample performers...');
            var insertion2 = db.prepare(`
        INSERT INTO Performers (performer_name, genre, year_started)
        VALUES (?, ?, ?)
      `);
            insertion2.run('The Rockers', 'Rock', 1999);
            insertion2.run('Smooth Jazz', 'Jazz', 2010);
            insertion2.run('50 Cent', 'Pop', 2015);
            insertion2.finalize();
        }
    });

    db.get(`SELECT COUNT(*) AS count FROM ConcertPerformers`, (err, row) => {
        if (row.count === 0) {
            console.log('Linking performers to concerts...');
            var insertion3 = db.prepare(`
        INSERT INTO ConcertPerformers (concert_id, performer_id, stage_time)
        VALUES (?, ?, ?)
      `);
            insertion3.run(1, 1, '19:00');
            insertion3.run(1, 2, '20:00');
            insertion3.run(2, 2, '22:00');
            insertion3.run(3, 3, '18:30');
            insertion3.finalize();
        }
    });
    db.get(`SELECT COUNT(*) AS count FROM Users`, (err, row) => {
        if (!err && row.count === 0) {
            db.run(
                `INSERT INTO Users (username, password) VALUES (?, ?)`,
                ['User', '321ewQ']
            );
        }
    });

}

module.exports = db;
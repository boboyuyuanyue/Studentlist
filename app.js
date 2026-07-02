const express = require('express');
const mysql = require('mysql2');

const app = express();

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'RP738964$',   // Change this if your MySQL password is different
    database: 'c237_studentlistapp'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


// =======================
// HOME PAGE
// =======================
app.get('/', (req, res) => {

    const sql = `
        SELECT
            studentId,
            studentName,
            DATE_FORMAT(dob, '%Y-%m-%d') AS dob,
            contact,
            image
        FROM student
    `;

    connection.query(sql, (error, results) => {

        if (error) {
            console.log(error);
            return res.send("Database Error");
        }

        res.render('index', {
            students: results
        });

    });

});


// =======================
// VIEW ONE STUDENT
// =======================
app.get('/student/:id', (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT
            studentId,
            studentName,
            DATE_FORMAT(dob, '%Y-%m-%d') AS dob,
            contact,
            image
        FROM student
        WHERE studentId = ?
    `;

    connection.query(sql, [id], (error, results) => {

        if (error) {
            console.log(error);
            return res.send("Database Error");
        }

        if (results.length > 0) {

            res.render('student', {
                student: results[0]
            });

        } else {

            res.send("Student Not Found");

        }

    });

});


// =======================
// SHOW ADD STUDENT PAGE
// =======================
app.get('/addStudent', (req, res) => {

    res.render('addStudent');

});


// =======================
// ADD STUDENT
// =======================
app.post('/addStudent', (req, res) => {

    const { name, dob, contact, image } = req.body;

    const sql = `
        INSERT INTO student
        (studentName, dob, contact, image)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [name, dob, contact, image],
        (error, results) => {

            if (error) {
                console.log(error);
                return res.send("Error Adding Student");
            }

            res.redirect('/');

        });

});


// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'RP738964$',
    database: 'c237_studentlistapp'
});

// Connect
connection.connect((err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Connected to MySQL");
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// ================= HOME =================
app.get('/', (req, res) => {

    const sql = `
        SELECT
            studentId,
            studentName,
            DATE_FORMAT(dob,'%Y-%m-%d') AS dob,
            contact,
            image
        FROM student
    `;

    connection.query(sql, (err, results) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("index", {
            students: results
        });

    });

});

// ================= VIEW STUDENT =================
app.get('/student/:id', (req, res) => {

   const sql = 'SELECT * FROM student WHERE studentId = ?';

    connection.query(sql, [req.params.id], (err, results) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        if (results.length > 0) {

            res.render("student", {
                student: results[0]
            });

        } else {

            res.send("Student not found");

        }

    });

});

// ================= ADD PAGE =================
app.get('/addStudent', upload.single('image'), (req, res) => {

    res.render("addStudent");

});

// ================= ADD =================
app.post('/addStudent',upload.single('image'), (req, res) => {

    //const { name, dob, contact, image } = req.body;
    const { name, dob, contact } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename; // Save only the filename
    } else {
        image = null;
    }

    const sql = `INSERT INTO student(studentName,dob,contact,image) VALUES(?,?,?,?)`;

    connection.query(sql,
        [name, dob, contact, image],
        (error) => {

            if (error) {
                console.log(error);
                return res.send("Error");
            }

            res.redirect("/");

        });

});

// ================= EDIT PAGE =================
app.get('/editstudent/:id', (req, res) => {

    const sql = `
        SELECT
            studentId,
            studentName,
            DATE_FORMAT(dob,'%Y-%m-%d') AS dob,
            contact,
            image
        FROM student
        WHERE studentId=?
    `;

    connection.query(sql, [req.params.id], (err, results) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        if (results.length > 0) {

            res.render("editStudent", {
                student: results[0]
            });

        } else {

            res.send("Student not found");

        }

    });

});

// ================= UPDATE =================
app.post('/editstudent/:id', upload.single('image'), (req, res) => {

    const { name, dob, contact } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename; // Save only the filename
    } else {
        image = null;
    }

    const sql = `
        UPDATE student
        SET studentName=?,
            dob=?,
            contact=?,
            image=?
        WHERE studentId=?
    `;

    connection.query(sql,
        [name, dob, contact, image, req.params.id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Update Error");
            }

            res.redirect("/");

        });

});

// ================= DELETE =================
app.get('/deletestudent/:id', (req, res) => {

    const sql = "DELETE FROM student WHERE studentId=?";

    connection.query(sql,
        [req.params.id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Delete Error");
            }

            res.redirect("/");

        });

});

// ================= START =================
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
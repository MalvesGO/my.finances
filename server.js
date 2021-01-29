const express = require('express')
const path = require('path');
const mysql = require('mysql');
const { Socket } = require('socket.io');

const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'))
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req, res) => {
    res.render('index.html')
});
// respond with "hello world" when a GET request is made to the homepage
app.get('/relatorios', function (req, res) {
    res.render('relatorios.html')
});

// Definições da base de dados
var connection = mysql.createConnection({
    host: '85.234.145.18',
    user: 'myfinances',
    password: '3?pwTl1GtmNqiy0b',
    database: 'myfinances'
});

app.get('/apontamentos', function (req, res) {
    connection.query('SELECT * from apontamentos', function (error, messages, fields) {
        if (error) throw error;
        res.json(messages)
    });
});


let messages = [];

io.on('connection', socket => {
    // console.log(`Socket conectado ${socket.id}`)

    connection.query('SELECT * from apontamentos', function (error, messages, fields) {
        if (error) throw error;
        socket.emit('previousMessages', messages)
    });

    socket.on('sendMessage', data => {

        connection.query("INSERT INTO apontamentos (description, ammount) VALUES ('"+data.description+"', '"+data.ammount+"')", function (error, results, fields) {
            if (error) throw error;
        });

        messages.push(data)
        socket.broadcast.emit('recivedMessage', data)
    })
})

server.listen(3000);

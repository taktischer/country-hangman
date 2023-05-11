const http = require('http');
const fs = require('fs');
const express = require('express');
const path = require("path");
const app = express();

// define path to views and static files
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'src/static')));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
http.createServer(app);

app.get('/', function (req, res){
    res.render('index');
});

// app is listening on port 1339
app.listen(1339);

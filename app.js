const path = require('path');
const express = require('express');

const globals = require('./const');
const app = express();
const port = 8080;
globals.library = __dirname + '/library';

app.use(express.json());
var corsOptions = {
    origin: true,
    credentials: true
};
app.use(require('cors')(corsOptions));


app.use('/api/query', require('./api/query'));
app.use('/api/photo', require('./api/photo'));
app.use('/api/faces', require('./api/faces'));
app.use('/api/person', require('./api/person'));

app.use(express.static(path.join(__dirname, 'public/dist')));
app.listen(port, () => console.log('Listening on port ' + port));
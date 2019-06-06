const path = require('path');
const express = require('express');
const app = express();
const port = 8080;

var corsOptions = {
    origin: true,
    credentials: true
};
app.use(require('cors')(corsOptions));

app.use('/api/photo', require('./api/photo'));

app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => console.log('Listening on port ' + port));
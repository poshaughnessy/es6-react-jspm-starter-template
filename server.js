const express = require('express'),
    path = require('path'),
    PORT = process.env.PORT || 8000;

let app = express();

app.use( '/js', express.static('dist/js') );
app.use( '/css', express.static('dist/css') );

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.use((req, res) => {
    res.status(404).send('Page not found');
});

export default {
    start: function() {
        app.listen(PORT);
        console.log('Started server on port', PORT);
    }
};

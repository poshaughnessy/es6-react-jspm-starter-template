const express = require('express'),
    path = require('path'),
    PORT = process.env.PORT || 8000;

let paths = {
    prod: 'dist'
};

let app = express();

if( process.env.NODE_ENV === 'production' ) {

    console.log('Production');

    app.use( '/js', express.static(paths.prod + '/js') );
    app.use( '/css', express.static(paths.prod + '/css') );

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, paths.prod + '/index.html'));
    });


} else {

    console.log('Development');

    app.use( '/.tmp', express.static('.tmp') );
    app.use( '/src', express.static('src') );
    app.use( '/jspm_packages', express.static('jspm_packages'));
    app.use( '/config.js', express.static('config.js') );

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '/index.html'));
    });

}

app.use((req, res) => {
    res.status(404).send('Page not found');
});

export default {
    start: function() {
        app.listen(PORT);
        console.log('Started server on port', PORT);
    }
};

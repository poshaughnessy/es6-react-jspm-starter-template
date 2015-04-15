import React from 'react';
import AppComponent from './components/app.js!jsx';

React.render(
    React.createElement( AppComponent, {history: true} ),
    document.getElementById('app')
);

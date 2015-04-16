import React from 'react';
import PlaceholderComponent from './components/placeholderComponent.js!jsx';

React.render(
    React.createElement( PlaceholderComponent, {history: true} ),
    document.getElementById('app')
);

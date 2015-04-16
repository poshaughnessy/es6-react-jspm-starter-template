# ES6 + React + JSPM Starter Template

This is a little starting template for an ES6 (a.k.a. EcmaScript 2015) project using:

 * React
 * Babel
 * SystemJS
 * JSPM
 * Sass
 * Gulp
 * Node
 * Express

## Instructions

If you haven't already installed JSPM, do this first:

```
npm install -g jspm
npm install jspm
```

Then:

```
npm install
jspm install
gulp serve
```

Gulp will watch for JS and SCSS changes and recompile, but it won't live-reload (I just prefer to Cmd+R).

## Warning

I decided to take out Babel transpilation on the server-side and use built-in ES6 support in io.js. But enabling
"in progress" features, such as arrow functions, is "highly discouraged unless for testing purposes". See:

https://iojs.org/en/es6.html

## See also

This is one of a collection of three ES6 starter templates. The others are:

* [Browserify version](https://github.com/poshaughnessy/es6-react-starter-template)
* [Isomorphic Browserify version](https://github.com/poshaughnessy/es6-react-isomorphic-starter-template)

## Contact

Please [email me](mailto:peter.oshaughnessy@gmail.com) or [tweet me](http://twitter.com/poshaughnessy)
if you have any comments/suggestions/questions.





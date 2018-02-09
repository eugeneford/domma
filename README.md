<p align="center">
  <img src="https://raw.githubusercontent.com/eugeneford/domma/master/.github/domma-logo.png" width="100" height="100">
</p>

<h3 align="center">
  Domma
</h3>

<p align="center">
  Keep your live and static documents in sync
</p>

<p align="center">
  <a href="https://travis-ci.org/eugeneford/domma">
    <img src="https://travis-ci.org/eugeneford/domma.svg?branch=master" alt="Build Status">
  </a>
  <a href='https://coveralls.io/github/eugeneford/domma'>
    <img src='https://coveralls.io/repos/github/eugeneford/domma/badge.svg?v=0' alt='Coverage Status' />
  </a>
  <a href='https://www.npmjs.com/package/domma'>
    <img src='https://img.shields.io/npm/v/domma.svg?v=0' alt='NPM Version' />
  </a>
</p>

## Overview

## How to Install
```js
npm install --save domma
```

## Get Started
```js
import Domma from "domma";

// Get your own static document
const staticDocument = document.implementation.createHTMLDocument('');

// Create Domma instance
const domma = new Domma();

// Connect your static document to domma
domma.connectStaticDocument(staticDocument);

// Compose a "live" clone of your document 
domma.composeLiveDocument();

// Apply any dynamic changes that should not be synced with static DOM
const liveDocument = domma.getLiveDocument();
liveDocument.body.setAttribute('id', 'dynamic-id');

// Apply changes that should be synced with static DOM
domma.conductTransaction((liveDOM) => {
  liveDOM.body.innerHTML = 'hello world';
}).then(() => {
  const staticDOM = domma.getStaticDocument();
  const body = staticDOM.body;
  
  // Dynamic changes are not synced
  const id = body.getAttribute('id'); // id => undefined
  
  // Transaction changes are synced
  const html = body.innerHTML; // html => 'hello world'
});

```

## Contributing to Domma
Contributions are always welcome.
Before contributing please read the [code of conduct](https://js.foundation/community/code-of-conduct) &
[search the issue tracker](https://github.com/eugeneford/domma/issues) (your issue may have already been discussed or fixed).

To contribute, follow next steps:
* Fork Domma
* Commit your changes
* Open a Pull Request.

### Feature Requests
Feature requests should be submitted in the issue tracker, with a description
of the expected behavior & use case, where they'll remain closed until sufficient interest (e.g. :+1: reactions).
Before submitting a feature request, please search for similar ones in the closed issues.

## License
Released under the [MIT License](https://github.com/eugeneford/domma/blob/master/LICENSE)

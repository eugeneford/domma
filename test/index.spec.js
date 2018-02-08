import './domma.spec';
import './mutation-driver.spec';
import './squash-mutations.spec';
import './reference-map.spec';

import Domma from '../src/domma';

describe('integrations tests', () => {
  it('node attributes are synced', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.conductTransaction((liveDOM) => {
      liveDOM.body.setAttribute('id', 'page');
    }).then(() => {
      expect(staticDOM.body.getAttribute('id')).toBe('page');
      done();
    });
  });

  it('node internals are synced', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.conductTransaction((liveDOM) => {
      const { body } = liveDOM;
      body.innerHTML = '<div>content</div>';
    }).then(() => {
      expect(staticDOM.body.innerHTML).toBe('<div>content</div>');
      done();
    });
  });

  it('additive text node is refused during the sync', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.driver.liveDOM.body.appendChild(document.createTextNode('dynamic'));
    domma.conductTransaction((liveDOM) => {
      const textNode = liveDOM.body.firstChild;
      textNode.textContent = 'should not be synced';
    }).then(() => {
      expect(staticDOM.body.childNodes.length).toBe(0);
      done();
    });
  });

  it('additive attribute is refused during the sync', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.driver.liveDOM.body.setAttribute('class', 'dynamic');
    domma.conductTransaction((liveDOM) => {
      const { body } = liveDOM;
      body.innerText = 'content';
    }).then(() => {
      expect(staticDOM.body.hasAttribute('class')).toBe(false);
      expect(staticDOM.body.innerText).toBe('content');
      done();
    });
  });

  it('added additive nodes are refused during the sync', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.driver.liveDOM.body.appendChild(document.createElement('div'));
    domma.conductTransaction((liveDOM) => {
      const { body } = liveDOM;
      body.appendChild(document.createTextNode('synced'));
    }).then(() => {
      expect(staticDOM.body.innerHTML).toBe('synced');
      done();
    });
  });

  it('removed additive nodes are prepended back during the sync', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    staticDOM.body.innerHTML = '<div></div><p></p>text<div></div><!--comment-->';

    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.driver.liveDOM.body.firstChild.setAttribute('id', 'additive');
    domma.driver.liveDOM.body.childNodes[2].nodeValue = 'mutated';
    domma.driver.liveDOM.body.childNodes[4].nodeValue = 'mutated';
    domma.driver.liveDOM.body.innerHTML = '<h1></h1>';

    domma.conductTransaction((liveDOM) => {
      const { body } = liveDOM;
      body.appendChild(document.createElement('section'));
    }).then(() => {
      const { body } = domma.driver.staticDOM;
      expect(body.innerHTML).toBe('<div></div><p></p>text<div></div><!--comment--><section></section>');
      done();
    });
  });

  it('removed additive nodes are appended back during the sync', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    staticDOM.body.innerHTML = '<div></div><p></p>text<div></div><!--comment-->';

    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.driver.liveDOM.body.firstChild.setAttribute('id', 'additive');
    domma.driver.liveDOM.body.childNodes[2].nodeValue = 'mutated';
    domma.driver.liveDOM.body.childNodes[4].nodeValue = 'mutated';
    domma.driver.liveDOM.body.innerHTML = '<h1></h1>';

    domma.conductTransaction((liveDOM) => {
      const { body } = liveDOM;
      body.insertBefore(document.createElement('section'), body.firstChild);
    }).then(() => {
      const { body } = domma.driver.staticDOM;
      expect(body.innerHTML).toBe('<section></section><div></div><p></p>text<div></div><!--comment-->');
      done();
    });
  });

  it('removed additive node is appended back during the sync', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    staticDOM.body.innerHTML = '<div></div><p></p>text<div></div><!--comment-->';

    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.driver.liveDOM.body.removeChild(domma.driver.liveDOM.body.childNodes[3]);

    domma.conductTransaction((liveDOM) => {
      const { body } = liveDOM;
      body.insertBefore(document.createElement('section'), body.lastChild);
    }).then(() => {
      const { body } = domma.driver.staticDOM;
      expect(body.innerHTML).toBe('<div></div><p></p>text<section></section><div></div><!--comment-->');
      done();
    });
  });

  it('sequence of attribute changes is correctly reverted', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    staticDOM.body.setAttribute('id', 'original');

    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.driver.liveDOM.body.setAttribute('id', 'changed-1');
    domma.driver.liveDOM.body.setAttribute('id', 'changed-2');
    domma.driver.liveDOM.body.setAttribute('id', 'changed-3');

    domma.conductTransaction((liveDOM) => {
      const { body } = liveDOM;
      body.innerHTML = 'text';
    }).then(() => {
      const { body } = domma.driver.staticDOM;
      expect(body.innerHTML).toBe('text');
      expect(body.getAttribute('id')).toBe('original');
      done();
    });
  });
});

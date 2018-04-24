import './domma.spec';
import './mutation-driver.spec';
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

  it('additive text node added between 2 static elements is refused during the sync', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    staticDOM.body.innerHTML = '<div></div><div></div>';
    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.driver.liveDOM.body.insertBefore(document.createTextNode('dynamic'), domma.driver.liveDOM.body.lastChild);
    domma.conductTransaction((liveDOM) => {
      const { body } = liveDOM;
      body.appendChild(document.createElement('p'));
    }).then(() => {
      expect(staticDOM.body.innerHTML).toBe('<div></div><div></div><p></p>');
      done();
    });
  });

  it('additive text node added as the last node is refused during the sync', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    staticDOM.body.innerHTML = '<div></div>';
    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    const additiveNode = document.createTextNode('dynamic');
    domma.driver.liveDOM.body.appendChild(additiveNode);
    domma.conductTransaction((liveDOM) => {
      const { body } = liveDOM;
      body.appendChild(document.createElement('p'));
    }).then(() => {
      expect(staticDOM.body.innerHTML).toBe('<div></div><p></p>');
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
      expect(body.innerHTML).toBe('<div></div><p></p>text<div></div><section></section><!--comment-->');
      done();
    });
  });

  it('sequence of additive attribute changes is correctly reverted', (done) => {
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

  it('sequence of additive node removals is correctly reverted', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    staticDOM.body.innerHTML = '<div></div><p></p>text<div></div><!--comment-->';

    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.driver.liveDOM.body.removeChild(domma.driver.liveDOM.body.childNodes[1]);
    domma.driver.liveDOM.body.removeChild(domma.driver.liveDOM.body.childNodes[1]);
    domma.driver.liveDOM.body.removeChild(domma.driver.liveDOM.body.childNodes[1]);

    domma.conductTransaction((liveDOM) => {
      const { body } = liveDOM;
      body.insertBefore(document.createElement('section'), body.lastChild);
    }).then(() => {
      const { body } = domma.driver.staticDOM;
      expect(body.innerHTML).toBe('<div></div><p></p>text<div></div><section></section><!--comment-->');
      done();
    });
  });

  it('sequence of additive node inserts is refused during the sync', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    staticDOM.body.innerHTML = '<h1></h1>';

    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    domma.driver.liveDOM.body.innerHTML = 'text1<!--comment-->text2';
    domma.driver.liveDOM.body.innerHTML = '<div></div>';

    domma.conductTransaction((liveDOM) => {
      const { body } = liveDOM;
      body.firstChild.appendChild(document.createTextNode('text'));
    }).then(() => {
      expect(staticDOM.body.innerHTML).toBe('<h1></h1>');
      done();
    });
  });

  it('liveNode and its children have the same uuid after sync', (done) => {
    const domma = new Domma();
    const staticDOM = document.implementation.createHTMLDocument('integration');
    staticDOM.body.innerHTML = '<div id="main" class="main"><section id="section-1"><div class="container"><h1>Hello World</h1></div></section><section id="section-2"></section></div>';

    domma.connectStaticDocument(staticDOM);
    domma.composeLiveDocument();

    const mainBefore = domma.getLiveDocument().getElementById('main').dataset.uuid;
    const section1Before = domma.getLiveDocument().getElementById('section-1').dataset.uuid;
    const section2Before = domma.getLiveDocument().getElementById('section-2').dataset.uuid;

    domma.conductTransaction((liveDOM) => {
      const refElement = liveDOM.getElementById('section-1');
      refElement.insertAdjacentHTML('afterend', '<section>new content</section>');
    }).then(() => {
      const mainAfter = domma.getLiveDocument().getElementById('main').dataset.uuid;
      const section1After = domma.getLiveDocument().getElementById('section-1').dataset.uuid;
      const section2After = domma.getLiveDocument().getElementById('section-2').dataset.uuid;

      expect(mainBefore).toBe(mainAfter);
      expect(section1Before).toBe(section1After);
      expect(section2Before).toBe(section2After);
      done();
    });
  });
});

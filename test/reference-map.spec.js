import ReferenceMap from '../src/reference-map';

describe('ReferenceMap', () => {
  describe('constructor', () => {
    it('TypeError is thrown when called as a function', () => {
      expect(() => ReferenceMap()).toThrowError(TypeError);
    });

    it('is created', () => {
      expect(new ReferenceMap()).toBeDefined();
    });

    it('options are overwritten', () => {
      const referenceMap = new ReferenceMap({
        referenceAttribute: 'data-ws-id',
      });

      expect(referenceMap.options.referenceAttribute).toBe('data-ws-id');
      expect(referenceMap.options.forEachReferenceSave()).toBeUndefined();
    });
  });

  describe('connectStaticDocument', () => {
    it('is connected', () => {
      const referenceMap = new ReferenceMap();
      const staticDocument = document.implementation.createHTMLDocument();
      referenceMap.connectStaticDocument(staticDocument);

      expect(referenceMap.staticDocument).toBe(staticDocument);
    });
  });

  describe('saveReference', () => {
    let referenceMap;
    let liveNode;
    let staticNode;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      liveNode = document.createElement('div');
      staticNode = document.createElement('div');
    });

    it('is saved', () => {
      const refAttr = referenceMap.options.referenceAttribute;
      const id = referenceMap.saveReference(liveNode, staticNode);

      expect(liveNode.getAttribute(refAttr)).toBe(id);
      expect(referenceMap.map[id]).toBeDefined();
      expect(referenceMap.map[id].staticNode).toBe(staticNode);
    });

    it('passed id is used', () => {
      const id = '40b24641-57e1-4ed3-90fd-09937a47d8fc';
      expect(referenceMap.saveReference(liveNode, staticNode, id)).toBe(id);
    });
  });

  describe('composeStaticReference', () => {
    let referenceMap;
    let refAttribute;
    let staticDocument;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
      staticDocument = document.implementation.createHTMLDocument();
      referenceMap.connectStaticDocument(staticDocument);
    });

    it('TypeError is thrown for text node', () => {
      const node = staticDocument.createTextNode('');
      expect(() => referenceMap.composeStaticReference(node)).toThrowError(TypeError);
    });

    it('TypeError is thrown for comment node', () => {
      const node = staticDocument.createComment('');
      expect(() => referenceMap.composeStaticReference(node)).toThrowError(TypeError);
    });

    it('ReferenceError is thrown when static document is not connected', () => {
      referenceMap.staticDocument = undefined;
      const node = staticDocument.createElement('div');
      expect(() => referenceMap.composeStaticReference(node)).toThrowError(ReferenceError);
    });

    it('callback is called', (done) => {
      referenceMap.options.forEachReferenceSave = () => done();
      referenceMap.composeStaticReference(staticDocument.createElement('div'));
    });

    it('node is composed', (done) => {
      let count = 0;
      referenceMap.options.forEachReferenceSave = (lNode, sNode) => {
        const id = lNode.getAttribute(refAttribute);
        expect(lNode.hasAttribute(refAttribute)).toBe(true);
        expect(referenceMap.map[id]).toBeDefined();
        expect(referenceMap.map[id].staticNode).toBe(sNode);

        count += 1;
        if (count === 2) done();
      };
      const liveNode = staticDocument.createElement('div');
      liveNode.innerHTML = '<p>text</p>';
      const staticNode = referenceMap.composeStaticReference(liveNode);
      expect(staticNode.hasAttribute(refAttribute)).toBe(false);
    });

    it('specified id is used', (done) => {
      referenceMap.options.forEachReferenceSave = (lNode, sNode) => {
        const id = lNode.getAttribute(refAttribute);
        expect(lNode.hasAttribute(refAttribute)).toBe(true);
        expect(referenceMap.map[id]).toBeDefined();
        expect(referenceMap.map[id].staticNode).toBe(sNode);
        done();
      };
      referenceMap.composeStaticReference(document.createElement('div'), 'test-id');
    });
  });

  describe('composeLiveReference', () => {
    let referenceMap;
    let refAttribute;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
    });

    it('TypeError is thrown for text node', () => {
      const node = document.createTextNode('');
      expect(() => referenceMap.composeLiveReference(node)).toThrowError(TypeError);
    });

    it('TypeError is thrown for comment node', () => {
      const node = document.createComment('');
      expect(() => referenceMap.composeLiveReference(node)).toThrowError(TypeError);
    });

    it('callback is called', (done) => {
      referenceMap.options.forEachReferenceSave = () => done();
      referenceMap.composeLiveReference(document.createElement('div'));
    });

    it('element is composed', (done) => {
      let count = 0;
      referenceMap.options.forEachReferenceSave = (lNode, sNode) => {
        const id = lNode.getAttribute(refAttribute);
        expect(lNode.hasAttribute(refAttribute)).toBe(true);
        expect(referenceMap.map[id]).toBeDefined();
        expect(referenceMap.map[id].staticNode).toBe(sNode);

        count += 1;
        if (count === 2) done();
      };
      const staticNode = document.createElement('div');
      staticNode.innerHTML = '<p>text</p>';
      const liveNode = referenceMap.composeLiveReference(staticNode);
      expect(liveNode.hasAttribute(refAttribute)).toBe(true);
    });

    it('document is composed', (done) => {
      let count = 0;
      referenceMap.options.forEachReferenceSave = (lNode, sNode) => {
        const id = lNode.getAttribute(refAttribute);
        expect(lNode.hasAttribute(refAttribute)).toBe(true);
        expect(referenceMap.map[id]).toBeDefined();
        expect(referenceMap.map[id].staticNode).toBe(sNode);

        count += 1;
        if (count === 2) done();
      };
      const staticDOM = document.implementation.createHTMLDocument('test');
      referenceMap.composeLiveReference(staticDOM);
    });

    it('specified id is used', (done) => {
      referenceMap.options.forEachReferenceSave = (lNode, sNode) => {
        const id = lNode.getAttribute(refAttribute);
        expect(lNode.hasAttribute(refAttribute)).toBe(true);
        expect(referenceMap.map[id]).toBeDefined();
        expect(referenceMap.map[id].staticNode).toBe(sNode);
        done();
      };
      referenceMap.composeLiveReference(document.createElement('div'), 'test-id');
    });
  });

  describe('isReferenceId', () => {
    let referenceMap;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
    });

    it('is correct', () => {
      referenceMap.map['test-id'] = {};
      expect(referenceMap.isReferenceId('test-id')).toBe(true);
      expect(referenceMap.isReferenceId('other-id')).toBe(false);
    });
  });

  describe('getReferenceId', () => {
    let referenceMap;
    let refAttribute;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
    });

    it('is undefined for non-Element node', () => {
      expect(referenceMap.getReferenceId(1)).toBeUndefined();
    });

    it('returns correct id', () => {
      const node = document.createElement('div');
      node.setAttribute(refAttribute, 'test-id');
      expect(referenceMap.getReferenceId(node)).toBe('test-id');
    });
  });

  describe('getPreviousReferenceId', () => {
    let referenceMap;
    let refAttribute;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
    });

    it('returns correct id', () => {
      const prevId = 'prev-id';
      const currentId = 'current-id';
      const container = document.createElement('div');
      container.innerHTML = `<div ${refAttribute}="${prevId}"></div><p></p><div ${refAttribute}="${currentId}"></div>`;
      expect(referenceMap.getPreviousReferenceId(container.lastChild)).toBe(prevId);
    });
  });

  describe('getNextReferenceId', () => {
    let referenceMap;
    let refAttribute;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
    });

    it('returns correct id', () => {
      const nextId = 'next-id';
      const currentId = 'current-id';
      const container = document.createElement('div');
      container.innerHTML = `<div ${refAttribute}="${currentId}"></div><p></p><div ${refAttribute}="${nextId}"></div>`;
      expect(referenceMap.getNextReferenceId(container.firstChild)).toBe(nextId);
    });
  });

  describe('getParentReferenceId', () => {
    let referenceMap;
    let refAttribute;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
    });

    it('returns correct id', () => {
      const parentId = 'parent-id';
      const currentId = 'current-id';
      const container = document.createElement('div');
      container.innerHTML = `<div ${refAttribute}="${parentId}"><p><b ${refAttribute}="${currentId}"></b></p></div>`;
      const current = container.firstChild.firstChild.firstChild;
      expect(referenceMap.getParentReferenceId(current)).toBe(parentId);
    });
  });

  describe('hasReference', () => {
    let referenceMap;
    let refAttribute;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
    });

    it('returns true for element with reference', () => {
      const id = 'test-id';
      const node = document.createElement('div');

      referenceMap.map[id] = {};
      node.setAttribute(refAttribute, id);

      expect(referenceMap.hasReference(node)).toBe(true);
    });
  });

  describe('getReference', () => {
    let referenceMap;
    let refAttribute;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
    });

    it('returns the reference of target element', () => {
      const id = 'test-id';
      const node = document.createElement('div');

      referenceMap.map[id] = { staticNode: 1 };
      node.setAttribute(refAttribute, id);

      expect(referenceMap.getReference(node)).toBe(1);
    });

    it('returns undefined for element without reference', () => {
      const id = 'test-id';
      const node = document.createElement('div');

      node.setAttribute(refAttribute, id);

      expect(referenceMap.getReference(node)).toBeUndefined();
    });
  });

  describe('setReferenceAttribute', () => {
    let referenceMap;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
    });

    it('ReferenceError is thrown when reference with target id is not found', () => {
      expect(() => referenceMap.setReferenceAttribute()).toThrowError(ReferenceError);
    });

    it('attribute is changed', () => {
      const id = 'test-id';
      const attr = 'class';
      const value = 'btn';
      const element = document.createElement('a');

      referenceMap.map[id] = { staticNode: element };
      referenceMap.setReferenceAttribute(id, attr, value);

      expect(element.getAttribute(attr)).toBe(value);
    });
  });

  describe('hasReferenceAttribute', () => {
    let referenceMap;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
    });

    it('ReferenceError is thrown when reference with target id is not found', () => {
      expect(() => referenceMap.hasReferenceAttribute()).toThrowError(ReferenceError);
    });

    it('is true for target reference', () => {
      const id = 'test-id';
      const attr = 'class';
      const element = document.createElement('a');

      referenceMap.map[id] = { staticNode: element };
      element.setAttribute(attr, 'btn');

      expect(referenceMap.hasReferenceAttribute(id, attr)).toBe(true);
    });
  });

  describe('removeReferenceAttribute', () => {
    let referenceMap;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
    });

    it('ReferenceError is thrown when reference with target id is not found', () => {
      expect(() => referenceMap.removeReferenceAttribute()).toThrowError(ReferenceError);
    });

    it('attribute is removed', () => {
      const id = 'test-id';
      const attr = 'class';
      const element = document.createElement('a');

      referenceMap.map[id] = { staticNode: element };
      element.setAttribute(attr, 'btn');
      referenceMap.removeReferenceAttribute(id, attr);

      expect(element.hasAttribute(attr)).toBe(false);
    });
  });

  describe('removeReference', () => {
    let referenceMap;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
    });

    it('ReferenceError is thrown when reference with target id is not found', () => {
      expect(() => referenceMap.removeReference()).toThrowError(ReferenceError);
    });

    it('reference is removed', () => {
      const id = 'test-id';
      const container = document.createElement('div');
      const element = document.createElement('h1');
      container.appendChild(element);

      referenceMap.map[id] = { staticNode: element };
      referenceMap.removeReference(id);

      expect(referenceMap.map[id]).toBeUndefined();
    });
  });

  describe('appendReference', () => {
    let referenceMap;
    let refAttribute;
    let staticDocument;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
      staticDocument = document.implementation.createHTMLDocument();
      referenceMap.connectStaticDocument(staticDocument);
    });

    it('ReferenceError is thrown when reference with target id is not found', () => {
      expect(() => referenceMap.appendReference()).toThrowError(ReferenceError);
    });

    it('reference is appended', () => {
      const containerId = 'container-id';
      const container = staticDocument.createElement('div');
      const element = staticDocument.createElement('h1');

      container.setAttribute(refAttribute, containerId);
      referenceMap.map[containerId] = { staticNode: container };

      const addedElement = referenceMap.appendReference(element, containerId);

      expect(container.firstChild).toBe(addedElement);
    });
  });

  describe('insertReferenceBefore', () => {
    let referenceMap;
    let refAttribute;
    let staticDocument;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
      staticDocument = document.implementation.createHTMLDocument();
      referenceMap.connectStaticDocument(staticDocument);
    });

    it('ReferenceError is thrown when reference with target id is not found', () => {
      expect(() => referenceMap.insertReferenceBefore()).toThrowError(ReferenceError);
    });

    it('reference is inserted', () => {
      const container = staticDocument.createElement('div');
      const referenceId = 'reference-id';
      const reference = staticDocument.createElement('p');
      const element = staticDocument.createElement('h1');
      container.appendChild(reference);

      container.setAttribute(refAttribute, referenceId);
      referenceMap.map[referenceId] = { staticNode: reference };

      const insertedElement = referenceMap.insertReferenceBefore(element, referenceId);

      expect(reference.previousSibling).toBe(insertedElement);
    });
  });

  describe('replaceReference', () => {
    let referenceMap;
    let refAttribute;
    let staticDocument;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
      staticDocument = document.implementation.createHTMLDocument();
      referenceMap.connectStaticDocument(staticDocument);
    });

    it('ReferenceError is thrown when reference with target id is not found', () => {
      expect(() => referenceMap.replaceReference()).toThrowError(ReferenceError);
    });

    it('reference is inserted', () => {
      const container = staticDocument.createElement('div');
      const referenceId = 'reference-id';
      const reference = staticDocument.createElement('p');
      const element = staticDocument.createElement('h1');
      container.appendChild(reference);

      container.setAttribute(refAttribute, referenceId);
      referenceMap.map[referenceId] = { staticNode: reference };

      const insertedElement = referenceMap.replaceReference(element, referenceId);

      expect(container.firstChild).toBe(insertedElement);
      expect(reference.parentNode).toBe(null);
    });
  });

  describe('flush', () => {
    let referenceMap;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
    });

    it('ejected reference is flushed', () => {
      const node = document.createElement('div');
      referenceMap.map[1] = { staticNode: node };
      referenceMap.flush();
      expect(Object.keys(referenceMap.map).length).toBe(0);
    });

    it('reference with ejected parent is flushed', () => {
      const container = document.createElement('div');
      const node = document.createElement('div');
      container.appendChild(node);
      referenceMap.map[1] = { staticNode: node };
      referenceMap.flush();
      expect(Object.keys(referenceMap.map).length).toBe(0);
    });
  });

  describe('unbind', () => {
    let referenceMap;
    let refAttribute;

    beforeEach(() => {
      referenceMap = new ReferenceMap();
      refAttribute = referenceMap.options.referenceAttribute;
    });

    it('binding attributes are removed', () => {
      const node = document.createElement('div');
      node.setAttribute(refAttribute, 'test-id');
      referenceMap.unbind(node);
      expect(node.hasAttribute(refAttribute)).toBe(false);
    });
  });
});

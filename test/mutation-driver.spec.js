import MutationDriver from '../src/mutation-driver';

describe('MutationDriver', () => {
  describe('constructor', () => {
    it('is created', () => {
      expect(new MutationDriver()).toBeDefined();
    });
  });

  describe('connectStaticDocument', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
    });

    it('type error is thrown if staticDOM is not a document', () => {
      expect(() => driver.connectStaticDocument()).toThrowError(TypeError);
    });

    it('document is connected', () => {
      const dom = document.implementation.createHTMLDocument();
      driver.connectStaticDocument(dom);
      expect(driver.staticDOM).toBe(dom);
    });
  });

  describe('connectLiveDocument', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
    });

    it('type error is thrown if staticDOM is not a document', () => {
      expect(() => driver.connectLiveDocument()).toThrowError(TypeError);
    });

    it('document is connected', () => {
      const dom = document.implementation.createHTMLDocument();
      driver.connectLiveDocument(dom);
      expect(driver.liveDOM).toBe(dom);
    });
  });

  describe('getStaticDocument', () => {
    let driver;
    let dom;

    beforeEach(() => {
      driver = new MutationDriver();
      dom = document.implementation.createHTMLDocument();
      driver.connectStaticDocument(dom);
    });

    it('returns static document', () => {
      expect(driver.getStaticDocument()).toBe(dom);
    });
  });

  describe('getLiveDocument', () => {
    let driver;
    let dom;

    beforeEach(() => {
      driver = new MutationDriver();
      dom = document.implementation.createHTMLDocument();
      driver.connectLiveDocument(dom);
    });

    it('returns static document', () => {
      expect(driver.getLiveDocument()).toBe(dom);
    });
  });

  describe('conductMutation', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
    });

    it('ignores attribute mutation if target has no reference', () => {
      const conductAttributeMutationSpy = spyOn(driver, 'conductAttributeMutation');
      const mutation = { type: 'attributes' };
      driver.referenceMap.hasReference = () => false;
      driver.conductMutation(mutation);
      expect(conductAttributeMutationSpy).toHaveBeenCalledTimes(0);
    });

    it('conducted attribute mutation if target has a reference', () => {
      const conductAttributeMutationSpy = spyOn(driver, 'conductAttributeMutation');
      const mutation = { type: 'attributes' };
      driver.referenceMap.hasReference = () => true;
      driver.conductMutation(mutation);
      expect(conductAttributeMutationSpy).toHaveBeenCalled();
    });

    it('ignores character mutation if target has no reference', () => {
      const conductAttributeMutationSpy = spyOn(driver, 'conductCharacterDataMutation');
      const mutation = {
        type: 'characterData',
        target: {
          parentNode: {},
        },
      };
      driver.referenceMap.hasReference = () => false;
      driver.conductMutation(mutation);
      expect(conductAttributeMutationSpy).toHaveBeenCalledTimes(0);
    });

    it('conducted character mutation if target has a reference', () => {
      const conductAttributeMutationSpy = spyOn(driver, 'conductCharacterDataMutation');
      const mutation = {
        type: 'characterData',
        target: {
          parentNode: {},
        },
      };
      driver.referenceMap.hasReference = () => true;
      driver.conductMutation(mutation);
      expect(conductAttributeMutationSpy).toHaveBeenCalled();
    });

    it('ignores childList mutation if target has no reference', () => {
      const conductAttributeMutationSpy = spyOn(driver, 'conductChildListMutation');
      const mutation = { type: 'childList' };
      driver.referenceMap.hasReference = () => false;
      driver.conductMutation(mutation);
      expect(conductAttributeMutationSpy).toHaveBeenCalledTimes(0);
    });

    it('conducted childList mutation if target has a reference', () => {
      const conductAttributeMutationSpy = spyOn(driver, 'conductChildListMutation');
      const mutation = { type: 'childList' };
      driver.referenceMap.hasReference = () => true;
      driver.conductMutation(mutation);
      expect(conductAttributeMutationSpy).toHaveBeenCalled();
    });
  });

  describe('conductAttributeMutation', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
    });

    it('attribute is changed', () => {
      const setReferenceAttributeSpy = spyOn(driver.referenceMap, 'setReferenceAttribute');
      const getReferenceIdSpy = spyOn(driver.referenceMap, 'getReferenceId');
      const mutation = {
        target: document.createElement('div'),
        attributeName: 'class',
      };
      mutation.target.setAttribute('class', 'btn');
      getReferenceIdSpy.and.returnValue('test-id');

      driver.conductAttributeMutation(mutation);

      expect(setReferenceAttributeSpy).toHaveBeenCalledWith('test-id', 'class', 'btn');
    });

    it('attribute is removed', () => {
      const removeReferenceAttributeSpy = spyOn(driver.referenceMap, 'removeReferenceAttribute');
      const getReferenceIdSpy = spyOn(driver.referenceMap, 'getReferenceId');
      const mutation = {
        target: document.createElement('div'),
        attributeName: 'class',
      };
      getReferenceIdSpy.and.returnValue('test-id');

      driver.conductAttributeMutation(mutation);

      expect(removeReferenceAttributeSpy).toHaveBeenCalledWith('test-id', 'class');
    });

    it('callbacks are called correctly', () => {
      const onBeforeSyncSpy = spyOn(driver.options, 'onBeforeSync');
      const onAfterSyncSpy = spyOn(driver.options, 'onAfterSync');
      const reference = document.createElement('div');
      const mutation = {
        target: document.createElement('div'),
        attributeName: 'class',
      };

      spyOn(driver.referenceMap, 'getReferenceId').and.returnValue('test-id');
      spyOn(driver.referenceMap, 'getReference').and.returnValue(reference);
      spyOn(driver.referenceMap, 'removeReferenceAttribute');

      driver.conductAttributeMutation(mutation);

      expect(onBeforeSyncSpy).toHaveBeenCalledWith(reference);
      expect(onAfterSyncSpy).toHaveBeenCalledWith(reference);
    });
  });

  describe('conductCharacterDataMutation', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
    });

    it('parent reference is replaced', () => {
      const replaceReferenceSpy = spyOn(driver.referenceMap, 'replaceReference');
      const getReferenceIdSpy = spyOn(driver.referenceMap, 'getReferenceId');
      const mutation = {
        target: {
          parentNode: document.createElement('div'),
        },
      };
      getReferenceIdSpy.and.returnValue('parent-id');

      driver.conductCharacterDataMutation(mutation);

      expect(replaceReferenceSpy).toHaveBeenCalledWith(mutation.target.parentNode, 'parent-id');
    });

    it('callbacks are called correctly', () => {
      const onBeforeSyncSpy = spyOn(driver.options, 'onBeforeSync');
      const onAfterSyncSpy = spyOn(driver.options, 'onAfterSync');
      const reference = document.createElement('div');
      const newReference = document.createElement('div');
      const mutation = {
        target: {
          parentNode: document.createElement('div'),
        },
      };

      spyOn(driver.referenceMap, 'getReference').and.returnValue(reference);
      spyOn(driver.referenceMap, 'getReferenceId').and.returnValue('parent-id');
      spyOn(driver.referenceMap, 'replaceReference').and.returnValue(newReference);

      driver.conductCharacterDataMutation(mutation);

      expect(onBeforeSyncSpy).toHaveBeenCalledWith(reference);
      expect(onAfterSyncSpy).toHaveBeenCalledWith(newReference);
    });
  });

  describe('conductChildListMutation', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
    });

    it('reference is replaced', () => {
      const replaceReferenceSpy = spyOn(driver.referenceMap, 'replaceReference');
      const getReferenceIdSpy = spyOn(driver.referenceMap, 'getReferenceId');
      const mutation = {
        addedNodes: [],
        removedNodes: [],
        target: document.createElement('div'),
      };
      getReferenceIdSpy.and.returnValue('target-id');

      driver.conductChildListMutation(mutation);

      expect(replaceReferenceSpy).toHaveBeenCalledWith(mutation.target, 'target-id');
    });

    it('additive mutations of all inner nodes are reduced when .innerHTML is used', () => {
      const replaceReferenceSpy = spyOn(driver.referenceMap, 'replaceReference');
      const getReferenceIdSpy = spyOn(driver.referenceMap, 'getReferenceId');
      const mutation = {
        addedNodes: [1],
        removedNodes: [1],
        target: document.createElement('div'),
      };
      getReferenceIdSpy.and.returnValue('target-id');

      driver.conductChildListMutation(mutation);

      expect(replaceReferenceSpy).toHaveBeenCalledWith(mutation.target, 'target-id');
    });

    it('callbacks are called correctly', () => {
      const onBeforeSyncSpy = spyOn(driver.options, 'onBeforeSync');
      const onAfterSyncSpy = spyOn(driver.options, 'onAfterSync');
      const reference = document.createElement('div');
      const newReference = document.createElement('div');
      const mutation = {
        addedNodes: [1],
        removedNodes: [1],
        target: document.createElement('div'),
      };

      spyOn(driver.referenceMap, 'getReferenceId').and.returnValue('target-id');
      spyOn(driver.referenceMap, 'getReference').and.returnValue(reference);
      spyOn(driver.referenceMap, 'replaceReference').and.returnValue(newReference);

      driver.conductChildListMutation(mutation);

      expect(onBeforeSyncSpy).toHaveBeenCalledWith(reference);
      expect(onAfterSyncSpy).toHaveBeenCalledWith(newReference);
    });
  });

  describe('addAdditiveMutations', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
    });

    it('correct set of additive mutations is returned', () => {
      const additiveMutation = {
        type: 'attributes',
        target: document.createElement('div'),
      };

      driver.addAdditiveMutations([additiveMutation]);

      expect(driver.additiveMutations).toContain(additiveMutation);
    });
  });

  describe('getAdditiveMutations', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
      driver.additiveMutations = [
        {
          type: 'attributes',
          target: document.createElement('div'),
        },
        {
          type: 'childList',
          target: document.createElement('h1'),
        },
      ];
    });

    it('correct set of additive mutations is returned', () => {
      const liveNode = driver.additiveMutations[0].target;
      expect(driver.getAdditiveMutations(liveNode)).toContain(driver.additiveMutations[0]);
    });
  });

  describe('hasAdditiveMutations', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
      driver.additiveMutations = [
        {
          type: 'attributes',
          target: document.createElement('div'),
        },
        {
          type: 'childList',
          target: document.createElement('h1'),
        },
      ];
    });

    describe('when target element has additive mutations', () => {
      it('should return true', () => {
        const liveNode = driver.additiveMutations[0].target;
        expect(driver.hasAdditiveMutations(liveNode)).toBeTruthy();
      });
    });
  });

  describe('isAdditiveNode', () => {
    describe('when node was added as an additive mutation', () => {
      it('should return "true"', () => {
        const driver = new MutationDriver();
        const node = document.createTextNode('some text');
        const mutationRecord = {
          type: 'childList',
          addedNodes: [node],
        };

        driver.addAdditiveMutations([mutationRecord]);

        const isAdditive = driver.isAdditiveNode(node);

        expect(isAdditive).toBeTruthy();
      });
    });

    describe('when node was added as a child of node that was added as additive mutation', () => {
      it('should return "true"', () => {
        const driver = new MutationDriver();
        const node = document.createElement('div');
        node.innerHTML = 'hello world';

        const mutationRecord = {
          type: 'childList',
          addedNodes: [node],
        };

        driver.addAdditiveMutations([mutationRecord]);

        const isAdditive = driver.isAdditiveNode(node.firstChild);

        expect(isAdditive).toBeTruthy();
      });
    });
  });

  describe('reduceAdditiveMutations', () => {
    let driver;
    let targetNode;
    let addedNode;
    let removedNode;

    beforeEach(() => {
      targetNode = document.createElement('div');
      addedNode = document.createElement('p');
      removedNode = document.createElement('h1');
      driver = new MutationDriver();
      driver.additiveMutations = [
        {
          type: 'attributes',
          target: targetNode,
          addedNodes: [],
          removedNodes: [],
        },
        {
          type: 'childList',
          target: targetNode,
          addedNodes: [addedNode],
          removedNodes: [removedNode],
        },
        {
          type: 'attributes',
          target: addedNode,
          addedNodes: [],
          removedNodes: [],
        },
        {
          type: 'attributes',
          target: removedNode,
          addedNodes: [],
          removedNodes: [],
        },
      ];
    });

    it('additive mutations of target node and its children are reduced', () => {
      driver.reduceAdditiveMutations(targetNode, ['childList']);
      expect(driver.additiveMutations.length).toBe(1);
      expect(driver.additiveMutations[0].type).toBe('attributes');
      expect(driver.additiveMutations[0].target).toBe(targetNode);
    });
  });

  describe('conductTransaction', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
    });

    it('correct set of additive mutations is returned', () => {
      const conductMutationSpy = spyOn(driver, 'conductMutation');
      const mutations = [
        {
          type: 'attributes',
          target: document.createElement('div'),
        },
        {
          type: 'childList',
          target: document.createElement('div'),
        },
      ];

      driver.conductTransaction(mutations);

      expect(conductMutationSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('insertAdjacentElement', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();

      const staticDOM = document.implementation.createHTMLDocument('');
      const liveDOM = driver.referenceMap.composeLiveReference(staticDOM);

      driver.connectStaticDocument(staticDOM);
      driver.connectLiveDocument(liveDOM);
    });

    it('should insert target element into live and static documents', () => {
      const staticDocument = driver.getStaticDocument();
      const liveDocument = driver.getLiveDocument();
      const element = liveDocument.createElement('div');
      element.innerHTML = 'hello world';

      driver.insertAdjacentElement(element, liveDocument.body, 'afterbegin');

      expect(liveDocument.body.firstChild).toBeDefined();
      expect(liveDocument.body.firstChild.tagName).toBe('DIV');
      expect(liveDocument.body.firstChild.innerHTML).toBe('hello world');

      expect(staticDocument.body.firstChild).toBeDefined();
      expect(staticDocument.body.firstChild.tagName).toBe('DIV');
      expect(staticDocument.body.firstChild.innerHTML).toBe('hello world');
    });
  });

  describe('removeElement', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();

      const staticDOM = document.implementation.createHTMLDocument('');
      staticDOM.body.insertAdjacentHTML('afterbegin', '<div></div>');

      const liveDOM = driver.referenceMap.composeLiveReference(staticDOM);

      driver.connectStaticDocument(staticDOM);
      driver.connectLiveDocument(liveDOM);
    });

    it('should remove target element from live and static documents', () => {
      const staticDocument = driver.getStaticDocument();
      const liveDocument = driver.getLiveDocument();

      driver.removeElement(liveDocument.body.firstChild);

      expect(liveDocument.body.firstChild).toBeNull();
      expect(staticDocument.body.firstChild).toBeNull();
    });
  });

  describe('synchromizeElement', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();

      const staticDOM = document.implementation.createHTMLDocument('');
      staticDOM.body.innerHTML = 'hello world';

      const liveDOM = driver.referenceMap.composeLiveReference(staticDOM);

      driver.connectStaticDocument(staticDOM);
      driver.connectLiveDocument(liveDOM);
    });

    describe('when preserve filter is not passed', () => {
      it('should eject all additive mutations', () => {
        const staticDOM = driver.getStaticDocument();
        const liveDOM = driver.getLiveDocument();
        const body = liveDOM.querySelector('body');

        body.setAttribute('class', 'some-class');
        const attributeMutation = {
          type: 'attributes',
          target: body,
          attributeName: 'class',
        };

        body.firstChild.nodeValue = 'hello mutated';
        const characterDataMutation = {
          type: 'characterData',
          target: body.firstChild,
          oldValue: 'hello world',
        };

        const newNode = document.createElement('div');
        body.insertAdjacentElement('afterbegin', newNode);
        const childListMutation = {
          type: 'childList',
          target: body,
          addedNodes: [newNode],
          removedNodes: [],
          nextSibling: body.firstChild,
        };

        const mutations = [attributeMutation, characterDataMutation, childListMutation];

        driver.addAdditiveMutations(mutations);
        driver.synchronizeElement(body);

        expect(staticDOM.body.outerHTML).toBe('<body>hello world</body>');
        expect(driver.additiveMutations).toEqual(mutations);
      });
    });

    describe('when preserve filter is passed', () => {
      it('should preserve some mutations according to that filter', () => {
        const staticDOM = driver.getStaticDocument();
        const liveDOM = driver.getLiveDocument();
        const body = liveDOM.querySelector('body');

        body.setAttribute('class', 'some-class');
        const attributeMutation = {
          type: 'attributes',
          target: body,
          attributeName: 'class',
        };

        body.firstChild.nodeValue = 'hello mutated';
        const characterDataMutation = {
          type: 'characterData',
          target: body.firstChild,
          oldValue: 'hello world',
        };

        const newNode = document.createElement('div');
        body.insertAdjacentElement('afterbegin', newNode);
        const childListMutation = {
          type: 'childList',
          target: body,
          addedNodes: [newNode],
          removedNodes: [],
          nextSibling: body.firstChild,
        };

        driver.addAdditiveMutations([attributeMutation, characterDataMutation, childListMutation]);
        driver.synchronizeElement(body, mutation => mutation.type === 'characterData');

        expect(staticDOM.body.outerHTML).toBe('<body>hello mutated</body>');
        expect(driver.additiveMutations).toEqual([attributeMutation, childListMutation]);
      });
    });
  });

  describe('ejectAdditiveReferenceMapMutations', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
    });

    it('attributes are removed', () => {
      const unbindSpy = spyOn(driver.referenceMap, 'unbind');
      const getReferenceSpy = spyOn(driver.referenceMap, 'getReference');
      const liveElement = document.createElement('div');
      const staticElement = document.createElement('div');

      getReferenceSpy.and.returnValue(staticElement);
      driver.ejectAdditiveReferenceMapMutations(liveElement);
      expect(unbindSpy).toHaveBeenCalledWith(staticElement);
    });
  });

  describe('ejectAdditiveCharacterDataMutation', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
    });

    describe('when target node is an additive one', () => {
      it('should do nothing', () => {
        const isAdditiveNodeSpy = spyOn(driver, 'isAdditiveNode').and.returnValue(true);
        const getReferenceSpy = spyOn(driver.referenceMap, 'getReference');
        const liveNode = document.createTextNode('hello world');
        const mutation = { oldValue: 'hello John' };

        driver.ejectAdditiveCharacterDataMutation(liveNode, mutation);

        expect(isAdditiveNodeSpy).toHaveBeenCalledWith(liveNode);
        expect(getReferenceSpy).not.toHaveBeenCalled();
      });
    });

    describe('when target node is a static one', () => {
      it('should revert target mutation', () => {
        const mutation = { oldValue: 'hello world' };
        const liveNode = document.createElement('div');
        const staticNode = document.createElement('div');

        liveNode.innerHTML = 'mutated';
        staticNode.innerHTML = 'mutated';

        spyOn(driver, 'isAdditiveNode').and.returnValue(false);
        spyOn(driver.referenceMap, 'getReference').and.returnValue(staticNode);

        driver.ejectAdditiveCharacterDataMutation(liveNode.firstChild, mutation);

        expect(staticNode.firstChild.nodeValue).toBe(mutation.oldValue);
      });
    });
  });

  describe('ejectAdditiveAttributeMutation', () => {
    let driver;

    beforeEach(() => {
      driver = new MutationDriver();
    });

    it('old attribute value is reverted', () => {
      const setReferenceAttributeSpy = spyOn(driver.referenceMap, 'setReferenceAttribute');
      const getReferenceSpy = spyOn(driver.referenceMap, 'getReferenceId');
      const liveElement = document.createElement('div');
      const mutation = {
        attributeName: 'class',
        oldValue: 'initial',
      };

      getReferenceSpy.and.returnValue('reference-id');
      driver.ejectAdditiveAttributeMutation(liveElement, mutation);
      expect(setReferenceAttributeSpy).toHaveBeenCalledWith('reference-id', 'class', 'initial');
    });

    it('attribute is removed', () => {
      const removeReferenceAttributeSpy = spyOn(driver.referenceMap, 'removeReferenceAttribute');
      const getReferenceSpy = spyOn(driver.referenceMap, 'getReferenceId');
      const liveElement = document.createElement('div');
      const mutation = {
        attributeName: 'class',
      };

      getReferenceSpy.and.returnValue('reference-id');
      driver.ejectAdditiveAttributeMutation(liveElement, mutation);
      expect(removeReferenceAttributeSpy).toHaveBeenCalledWith('reference-id', 'class');
    });
  });
});

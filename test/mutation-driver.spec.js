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
});

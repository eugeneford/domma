import Domma from '../src/domma';

describe('domma', () => {
  describe('constructor', () => {
    it('instance is created', () => {
      expect(new Domma()).toBeDefined();
    });
  });

  describe('connectStaticDocument', () => {
    it('connected to driver', () => {
      const domma = new Domma();
      const spy = spyOn(domma.driver, 'connectStaticDocument');
      domma.connectStaticDocument({});
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getStaticDocument', () => {
    it('connected to driver', () => {
      const domma = new Domma();
      const spy = spyOn(domma.driver, 'getStaticDocument');
      domma.getStaticDocument();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getLiveDocument', () => {
    it('connected to driver', () => {
      const domma = new Domma();
      const spy = spyOn(domma.driver, 'getLiveDocument');
      domma.getLiveDocument();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('connectLiveDocument', () => {
    it('connected new document to driver', () => {
      const domma = new Domma();
      const dom = document.implementation.createHTMLDocument('');
      const spy = spyOn(domma.driver, 'connectLiveDocument');
      domma.connectLiveDocument(dom);
      expect(spy).toHaveBeenCalled();
    });

    it('disconnected previous document from MutationObserver', () => {
      const domma = new Domma();
      const dom = document.implementation.createHTMLDocument('');
      const spy = spyOn(domma.mutationObserver, 'disconnect');
      domma.connectLiveDocument(dom);
      expect(spy).toHaveBeenCalled();
    });

    it('connected new document to mutation observer', () => {
      const domma = new Domma();
      const dom = document.implementation.createHTMLDocument('');
      const spy = spyOn(domma.mutationObserver, 'observe');
      domma.connectLiveDocument(dom);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('composeLiveDocument', () => {
    it('reference error is thrown when static document is not connected', () => {
      const domma = new Domma();
      expect(() => domma.composeLiveDocument()).toThrowError(ReferenceError);
    });

    it('composed and connected new document to driver', () => {
      const domma = new Domma();
      const dom = document.implementation.createHTMLDocument('');
      const composeSpy = spyOn(domma.driver.referenceMap, 'composeLiveReference');
      const connectSpy = spyOn(domma, 'connectLiveDocument');

      domma.connectStaticDocument(dom);
      domma.composeLiveDocument();

      expect(composeSpy).toHaveBeenCalled();
      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('isTransactionResolved', () => {
    it('true when transaction is resolved', () => {
      const domma = new Domma();
      domma.transactionStatus = 'resolved';
      expect(domma.isTransactionResolved()).toBe(true);
    });

    it('false when transaction is pending', () => {
      const domma = new Domma();
      domma.transactionStatus = 'pending';
      expect(domma.isTransactionResolved()).toBe(false);
    });
  });

  describe('isTransactionPending', () => {
    it('true when transaction is pending', () => {
      const domma = new Domma();
      domma.transactionStatus = 'pending';
      expect(domma.isTransactionPending()).toBe(true);
    });

    it('false when transaction is resolved', () => {
      const domma = new Domma();
      domma.transactionStatus = 'resolved';
      expect(domma.isTransactionPending()).toBe(false);
    });
  });

  describe('conductTransaction', () => {
    it('reference error is thrown when static document is not connected', () => {
      const domma = new Domma();
      expect(() => domma.composeLiveDocument()).toThrowError(ReferenceError);
    });

    describe('transaction', () => {
      let transactionSpy;

      beforeEach((done) => {
        const domma = new Domma();
        const dom = document.implementation.createHTMLDocument();

        transactionSpy = jasmine.createSpy('transactionSpy');

        domma.connectStaticDocument(dom);
        domma.composeLiveDocument();

        domma.conductTransaction((liveDOM) => {
          transactionSpy(liveDOM);
          done();
        });
      });

      it('transaction is launched', () => {
        expect(transactionSpy).toHaveBeenCalled();
      });
    });
  });

  describe('insertAdjacentElement', () => {
    let domma;

    beforeEach(() => {
      const dom = document.implementation.createHTMLDocument();

      domma = new Domma();
      domma.connectStaticDocument(dom);
      domma.composeLiveDocument();
    });

    it('should insert target element as a transaction change', (done) => {
      const staticDocument = domma.getStaticDocument();
      const liveDocument = domma.getLiveDocument();
      const element = document.createElement('div');
      element.innerHTML = 'hello world';

      domma.insertAdjacentElement(element, liveDocument.body, 'afterbegin').then(() => {
        expect(domma.driver.getAdditiveMutations().length).toBe(0);

        expect(liveDocument.body.firstChild).toBeDefined();
        expect(liveDocument.body.firstChild.tagName).toBe('DIV');
        expect(liveDocument.body.firstChild.innerHTML).toBe('hello world');

        expect(staticDocument.body.firstChild).toBeDefined();
        expect(staticDocument.body.firstChild.tagName).toBe('DIV');
        expect(staticDocument.body.firstChild.innerHTML).toBe('hello world');
        done();
      });
    });
  });

  describe('removeElement', () => {
    let domma;

    beforeEach(() => {
      const dom = document.implementation.createHTMLDocument();
      dom.body.insertAdjacentHTML('afterbegin', '<div></div>');

      domma = new Domma();
      domma.connectStaticDocument(dom);
      domma.composeLiveDocument();
    });

    it('should remove target element as a transaction change', (done) => {
      const staticDocument = domma.getStaticDocument();
      const liveDocument = domma.getLiveDocument();

      domma.removeElement(liveDocument.body.firstChild).then(() => {
        expect(domma.driver.getAdditiveMutations().length).toBe(0);
        expect(liveDocument.body.firstChild).toBeNull();
        expect(staticDocument.body.firstChild).toBeNull();
        done();
      });
    });
  });

  describe('synchronizeElement', () => {
    let domma;

    beforeEach((done) => {
      const staticDocument = document.implementation.createHTMLDocument();

      domma = new Domma();
      domma.connectStaticDocument(staticDocument);
      domma.composeLiveDocument();

      const liveDocument = domma.getLiveDocument();
      liveDocument.body.insertAdjacentHTML('afterbegin', '<h1>hello world</h1>');
      liveDocument.body.insertAdjacentHTML('beforeend', '<p>some text</p>');

      setTimeout(done, 100);
    });

    it('should synchronize element according to preserveFilter', (done) => {
      const staticDocument = domma.getStaticDocument();
      const liveDocument = domma.getLiveDocument();

      domma.synchronizeElement(liveDocument.body, (mutation) => {
        if (!mutation.addedNodes.length) return false;
        return mutation.addedNodes[0].tagName === 'H1';
      }).then(() => {
        expect(liveDocument.body.childNodes.length).toBe(2);
        expect(liveDocument.body.childNodes[0].tagName).toBe('H1');
        expect(liveDocument.body.childNodes[0].innerHTML).toBe('hello world');
        expect(liveDocument.body.childNodes[1].tagName).toBe('P');
        expect(liveDocument.body.childNodes[1].innerHTML).toBe('some text');
        expect(staticDocument.body.childNodes.length).toBe(1);
        expect(staticDocument.body.childNodes[0].tagName).toBe('H1');
        expect(staticDocument.body.childNodes[0].innerHTML).toBe('hello world');
        expect(domma.driver.additiveMutations.length).toBe(1);
        expect(domma.driver.additiveMutations[0].addedNodes[0].tagName).toBe('P');

        done();
      });
    });
  });

  describe('reset', () => {
    it('reset internal state', (done) => {
      const domma = new Domma();
      const dom = document.implementation.createHTMLDocument();

      domma.connectStaticDocument(dom);
      domma.composeLiveDocument();

      domma.conductTransaction((liveDOM) => {
        liveDOM.body.insertAdjacentHTML('afterbegin', '<div>hello world</div>');
      }).then(() => {
        domma.reset();
        expect(domma.driver.referenceMap.map).toEqual({});
        expect(domma.driver.getAdditiveMutations()).toEqual([]);
        expect(domma.getStaticDocument()).toBeUndefined();
        expect(domma.getLiveDocument()).toBeUndefined();
        done();
      });
    });
  });

  describe('mutationEmitter', () => {
    it('delegated additive mutations to driver', () => {
      const domma = new Domma();
      const driverSpy = spyOn(domma.driver, 'addAdditiveMutations');
      domma.transactionStatus = 'resolved';
      domma.mutationEmitter();
      expect(driverSpy).toHaveBeenCalled();
    });

    it('delegated transaction mutations to driver', () => {
      const domma = new Domma();
      const driverSpy = spyOn(domma.driver, 'conductTransaction');
      domma.transactionStatus = 'pending';
      domma.resolve = () => {
      };
      domma.mutationEmitter();
      expect(driverSpy).toHaveBeenCalled();
    });
  });
});

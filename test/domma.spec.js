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

  describe('additiveEmitter', () => {
    it('delegated additive mutations to driver', () => {
      const domma = new Domma();
      const driverSpy = spyOn(domma.driver, 'addAdditiveMutations');
      domma.transactionStatus = 'resolved';
      domma.additiveEmitter();
      expect(driverSpy).toHaveBeenCalled();
    });

    it('did nothing when transaction is pending', () => {
      const domma = new Domma();
      const driverSpy = spyOn(domma.driver, 'addAdditiveMutations');
      domma.transactionStatus = 'pending';
      domma.additiveEmitter();
      expect(driverSpy).toHaveBeenCalledTimes(0);
    });
  });
});

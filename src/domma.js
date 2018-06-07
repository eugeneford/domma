import MutationDriver from './mutation-driver';

export default class Domma {
  constructor(options) {
    this.options = options;
    this.config = {
      childList: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      subtree: true,
    };

    this.reset();
  }

  connectStaticDocument(staticDOM) {
    this.driver.connectStaticDocument(staticDOM);
    this.driver.referenceMap.connectStaticDocument(staticDOM);
  }

  composeLiveDocument() {
    const staticDOM = this.driver.getStaticDocument();

    if (!staticDOM) {
      throw new ReferenceError('static document is not connected');
    }

    const liveDOM = this.driver.referenceMap.composeLiveReference(staticDOM);

    this.connectLiveDocument(liveDOM);
  }

  connectLiveDocument(liveDOM) {
    this.mutationObserver.disconnect();
    this.driver.connectLiveDocument(liveDOM);
    this.mutationObserver.observe(liveDOM, this.config);
  }

  getStaticDocument() {
    return this.driver.getStaticDocument();
  }

  getLiveDocument() {
    return this.driver.getLiveDocument();
  }

  isTransactionResolved() {
    return this.transactionStatus === 'resolved';
  }

  isTransactionPending() {
    return this.transactionStatus === 'pending';
  }

  conductTransaction(transaction) {
    return new Promise((resolve, reject) => {
      const liveDOM = this.driver.getLiveDocument();
      if (!liveDOM) reject(new ReferenceError('live document is not connected'));
      resolve(liveDOM);
    }).then(liveDOM => new Promise((resolve) => {
      this.transactionStatus = 'pending';
      this.resolve = resolve;
      transaction(liveDOM);
    }));
  }

  reset() {
    if (this.transactionObserver) this.transactionObserver.disconnect();
    if (this.mutationObserver) this.mutationObserver.disconnect();

    this.driver = new MutationDriver(this.options);
    this.transactionStatus = 'resolved';
    this.transactionObserver = new MutationObserver(this.driver.conductTransaction);
    this.mutationEmitter = (mutations) => {
      if (this.isTransactionPending()) {
        this.driver.conductTransaction(mutations);
        this.transactionStatus = 'resolved';
        this.resolve(this.driver.getLastTransaction());
      } else {
        this.driver.addAdditiveMutations(mutations);
      }
    };
    this.mutationObserver = new MutationObserver(this.mutationEmitter);
  }
}

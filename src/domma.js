import MutationDriver from './mutation-driver';

export default class Domma {
  constructor(options) {
    this.config = {
      childList: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      subtree: true,
    };

    this.driver = new MutationDriver(options);
    this.transactionStatus = 'resolved';
    this.transactionObserver = new MutationObserver(this.driver.conductTransaction);
    this.additiveEmitter = (mutations) => {
      if (this.isTransactionPending()) return;
      this.driver.addAdditiveMutations(mutations);
    };
    this.mutationObserver = new MutationObserver(this.additiveEmitter);
  }

  connectStaticDocument(staticDOM) {
    this.driver.connectStaticDocument(staticDOM);
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

  async conductTransaction(transaction) {
    const liveDOM = this.driver.getLiveDocument();

    if (!liveDOM) {
      throw new ReferenceError('live document is not connected');
    }

    this.transactionStatus = await 'pending';
    await this.transactionObserver.observe(liveDOM, this.config);
    await transaction(liveDOM);
    await this.transactionObserver.disconnect();
    this.transactionStatus = await 'resolved';

    return this.driver.getLastTransaction();
  }
}

import MutationDriver from './mutation-driver';

export default class Domma {
  constructor(options) {
    this.driver = new MutationDriver(options);
    this.observer = new MutationObserver(this.driver.conductMutations);
    this.config = {
      childList: true,
      attributes: true,
      attributeOldValue: true,
      subtree: true,
    };
  }

  connectStaticDocument(staticDOM) {
    this.driver.connectStaticDocument(staticDOM);
  }

  composeLiveDocument() {
    const staticDOM = this.driver.getStaticDocument();

    if (!staticDOM) {
      throw new ReferenceError('static document is not connected');
    }

    const liveDOM = this.driver.composeLiveNode(staticDOM);

    this.driver.connectLiveDocument(liveDOM);
  }

  connectLiveDocument(liveDOM) {
    this.driver.connectLiveDocument(liveDOM);
  }

  async conductTransaction(transaction) {
    const liveDOM = this.driver.getLiveDocument();

    if (!liveDOM) {
      throw new ReferenceError('live document is not connected');
    }

    await this.observer.observe(liveDOM, this.config);
    await transaction(liveDOM);
    await this.observer.disconnect();

    return this.driver.getLastConductedMutations();
  }
}

import {
  isDocumentNode,
  isElementNode,
  traverseNode,
} from 'anodum';

import mutationTypes from './mutation-types';
import ReferenceMap from './reference-map';

export default class MutationDriver {
  constructor(options) {
    this.options = {
      onBeforeSync: () => {
      },
      onAfterSync: () => {
      },
      ...options,
    };
    this.additiveMutations = [];
    this.lastTransaction = undefined;
    this.referenceMap = new ReferenceMap(options);

    this.conductTransaction = this.conductTransaction.bind(this);
    this.conductMutation = this.conductMutation.bind(this);
    this.reduceAdditiveMutations = this.reduceAdditiveMutations.bind(this);
  }

  connectStaticDocument(staticDOM) {
    if (!isDocumentNode(staticDOM)) {
      throw new TypeError('staticDOM is not a Document');
    }

    this.staticDOM = staticDOM;
  }

  connectLiveDocument(liveDOM) {
    if (!isDocumentNode(liveDOM)) {
      throw new TypeError('liveDOM is not a Document');
    }

    this.liveDOM = liveDOM;
  }

  getStaticDocument() {
    return this.staticDOM;
  }

  getLiveDocument() {
    return this.liveDOM;
  }

  ejectAdditiveReferenceMapMutations(liveElement) {
    const containerNode = this.referenceMap.getReference(liveElement);
    this.referenceMap.unbind(containerNode);
  }

  ejectAdditiveAttributeMutation(liveElement, mutation) {
    const { attributeName, oldValue } = mutation;
    const containerId = this.referenceMap.getReferenceId(liveElement);

    if (oldValue) {
      this.referenceMap.setReferenceAttribute(containerId, attributeName, oldValue);
    } else {
      this.referenceMap.removeReferenceAttribute(containerId, attributeName);
    }
  }

  ejectAdditiveChildListMutation(liveElement, mutation) {
    const containerNode = this.referenceMap.getReference(liveElement);
    const {
      addedNodes,
      removedNodes,
    } = mutation;

    let nextLiveSibling = mutation.nextSibling;
    if (removedNodes.length && addedNodes.length) {
      nextLiveSibling = addedNodes[addedNodes.length - 1].nextSibling;
    } else if (removedNodes.length) {
      const { previousSibling, nextSibling } = mutation;
      let node = nextSibling;
      while (node) {
        if (previousSibling === node.previousSibling) {
          nextLiveSibling = node;
          break;
        }
        node = node.previousSibling;
      }
    }

    let nextStaticSibling;
    if (nextLiveSibling && nextLiveSibling.parentNode) {
      const liveNodes = Array.prototype.slice.call(nextLiveSibling.parentNode.childNodes);
      const liveIndex = liveNodes.indexOf(nextLiveSibling);
      nextStaticSibling = containerNode.childNodes[liveIndex];
    }

    const prevLiveSibling = mutation.previousSibling;

    let prevStaticSibling;
    if (prevLiveSibling && prevLiveSibling.parentNode) {
      const liveNodes = Array.prototype.slice.call(prevLiveSibling.parentNode.childNodes);
      const liveIndex = liveNodes.indexOf(prevLiveSibling);
      prevStaticSibling = containerNode.childNodes[liveIndex];
    }

    addedNodes.forEach((addedLiveNode) => {
      if (isElementNode(addedLiveNode)) {
        const id = this.referenceMap.getReferenceId(addedLiveNode);
        this.referenceMap.removeReference(id);
        this.referenceMap.unbind(addedLiveNode);
        this.reduceAdditiveMutations(addedLiveNode);
      } else {
        let staticNode;
        if (nextStaticSibling) {
          staticNode = nextStaticSibling.previousSibling;
        } else if (prevStaticSibling && prevStaticSibling.nextSibling) {
          staticNode = prevStaticSibling.nextSibling;
        } else {
          staticNode = containerNode.firstChild;
        }
        containerNode.removeChild(staticNode);
      }
    });

    removedNodes.forEach((removedLiveNode) => {
      let staticNode;
      if (isElementNode(removedLiveNode)) {
        staticNode = this.referenceMap.getReference(removedLiveNode);
      } else {
        staticNode = removedLiveNode.cloneNode();
        const textMutations = this.getAdditiveMutations(removedLiveNode);
        textMutations.forEach((textMutation) => {
          staticNode.nodeValue = textMutation.oldValue;
        });
      }

      if (nextStaticSibling) {
        containerNode.insertBefore(staticNode, nextStaticSibling);
      } else if (prevStaticSibling && prevStaticSibling.nextSibling) {
        containerNode.insertBefore(staticNode, prevStaticSibling.nextSibling);
      } else {
        containerNode.appendChild(staticNode);
      }
    });
  }

  ejectAdditiveMutations(liveElement) {
    traverseNode(liveElement, (lNode) => {
      const mutations = this.getAdditiveMutations(lNode);

      this.ejectAdditiveReferenceMapMutations(lNode);

      mutations.reverse().forEach((mutation) => {
        switch (mutation.type) {
          case mutationTypes.attributes:
            this.ejectAdditiveAttributeMutation(lNode, mutation);
            break;
          default:
            this.ejectAdditiveChildListMutation(lNode, mutation);
            break;
        }
      });
    });
  }

  addAdditiveMutations(mutations) {
    this.additiveMutations = this.additiveMutations.concat(mutations);
  }

  reduceAdditiveMutations(liveNode, types = mutationTypes.all) {
    const additiveMutations = this.getAdditiveMutations(liveNode, types);

    additiveMutations.forEach((mutation) => {
      const index = this.additiveMutations.indexOf(mutation);
      this.additiveMutations.splice(index, 1);
      mutation.addedNodes.forEach(node => this.reduceAdditiveMutations(node));
      mutation.removedNodes.forEach(node => this.reduceAdditiveMutations(node));
    });
  }

  getAdditiveMutations(liveNode, types = mutationTypes.all) {
    return this.additiveMutations.filter((mutation) => {
      const sameTarget = mutation.target === liveNode;
      const validType = types.indexOf(mutation.type) > -1;
      return sameTarget && validType;
    });
  }

  conductAttributeMutation(mutation) {
    const liveNode = mutation.target;
    const reference = this.referenceMap.getReference(liveNode);
    const referenceId = this.referenceMap.getReferenceId(liveNode);
    const attribute = mutation.attributeName;

    this.options.onBeforeSync(reference);
    if (liveNode.hasAttribute(attribute)) {
      const value = liveNode.getAttribute(attribute);
      this.referenceMap.setReferenceAttribute(referenceId, attribute, value);
    } else {
      this.referenceMap.removeReferenceAttribute(referenceId, attribute);
    }
    this.options.onAfterSync(reference);
  }

  conductCharacterDataMutation(mutation) {
    const liveNode = mutation.target.parentNode;
    const reference = this.referenceMap.getReference(liveNode);
    const referenceId = this.referenceMap.getReferenceId(liveNode);
    this.reduceAdditiveMutations(mutation.target, [mutationTypes.characterData]);
    this.options.onBeforeSync(reference);
    const newReference = this.referenceMap.replaceReference(liveNode, referenceId);
    this.ejectAdditiveMutations(liveNode);
    this.referenceMap.flush();
    this.options.onAfterSync(newReference);
  }

  conductChildListMutation(mutation) {
    const liveNode = mutation.target;
    const reference = this.referenceMap.getReference(liveNode);
    const referenceId = this.referenceMap.getReferenceId(liveNode);
    const {
      addedNodes,
      removedNodes,
      nextSibling,
      previousSibling,
    } = mutation;

    // for target.innerHTML or target.replacedChild
    if (addedNodes.length && removedNodes.length && !nextSibling && !previousSibling) {
      this.reduceAdditiveMutations(liveNode, [mutationTypes.childList]);
    }

    this.options.onBeforeSync(reference);
    const newReference = this.referenceMap.replaceReference(liveNode, referenceId);
    this.ejectAdditiveMutations(liveNode);
    this.referenceMap.flush();
    this.options.onAfterSync(newReference);
  }

  conductMutation(mutation) {
    switch (mutation.type) {
      case mutationTypes.attributes:
        if (!this.referenceMap.hasReference(mutation.target)) return;
        this.conductAttributeMutation(mutation);
        break;
      case mutationTypes.characterData:
        if (!this.referenceMap.hasReference(mutation.target.parentNode)) return;
        this.conductCharacterDataMutation(mutation);
        break;
      default:
        if (!this.referenceMap.hasReference(mutation.target)) return;
        this.conductChildListMutation(mutation);
        break;
    }
  }

  conductTransaction(mutations) {
    const transaction = mutations;
    transaction.forEach(this.conductMutation);
    this.lastTransaction = transaction;
  }

  getLastTransaction() {
    return this.lastTransaction;
  }
}

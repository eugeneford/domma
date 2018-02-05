import generateUuid from 'generate-uuid';
import {
  isNode,
  isDocumentNode,
  isTextNode,
  isElementNode,
  getNodeByTreePath,
  getTreePathOfNode,
  traverseNode,
} from 'anodum';

import mutationTypes from './mutation-types';
import squashMutations from './squash-mutations';

export default class MutationDriver {
  constructor(options) {
    this.options = {
      referenceAttribute: 'data-uuid',
      forEachReferenceSave: () => {
      },
      ...options,
    };

    this.referenceMap = {};
    this.additiveMutations = [];
    this.lastTransaction = undefined;
    this.conductTransaction = this.conductTransaction.bind(this);
    this.conductMutation = this.conductMutation.bind(this);
    this.reduceAdditiveMutationsOfNode = this.reduceAdditiveMutationsOfNode.bind(this);
  }

  cleanReferenceMap() {
    const records = Object.keys(this.referenceMap);
    records.forEach((id) => {
      const { staticNode } = this.referenceMap[id];
      let node = staticNode;

      while (node && !isDocumentNode(node)) {
        if (!node.parentNode) {
          delete this.referenceMap[id];
          return;
        }
        node = node.parentNode;
      }
    });
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

  saveReference(liveNode, staticNode, id = generateUuid()) {
    liveNode.setAttribute(this.options.referenceAttribute, id);
    this.referenceMap[id] = { staticNode };
  }

  composeStaticReference(liveNode, id) {
    const staticNode = liveNode.cloneNode(true);
    const rootPath = getTreePathOfNode(liveNode);

    traverseNode(liveNode, (lNode, path) => {
      if (!isElementNode(lNode)) return;

      path.splice(0, rootPath.length, 0);

      const sNode = getNodeByTreePath(staticNode, path);
      const refId = liveNode === lNode ? id : undefined;

      this.saveReference(lNode, sNode, refId);
      this.options.forEachReferenceSave(lNode, sNode);
    }, true);

    return staticNode;
  }

  composeLiveReference(staticNode, id) {
    if (!isDocumentNode(staticNode) && !isElementNode(staticNode)) {
      throw new TypeError('staticNode is not neither Document nor Element');
    }

    const staticRoot = isDocumentNode(staticNode) ? staticNode : staticNode.ownerDocument;
    const liveNode = staticNode.cloneNode(true);

    traverseNode(liveNode, (lNode, path) => {
      if (!isElementNode(lNode)) return;

      const sNode = getNodeByTreePath(staticRoot, path);
      const refId = liveNode === lNode ? id : undefined;

      this.saveReference(lNode, sNode, refId);
      this.options.forEachReferenceSave(lNode, sNode);
    }, true);

    return liveNode;
  }

  getStaticDocument() {
    return this.staticDOM;
  }

  getLiveDocument() {
    return this.liveDOM;
  }

  getLastTransaction() {
    return this.lastTransaction;
  }

  isReferenceId(id) {
    return Object.prototype.hasOwnProperty.call(this.referenceMap, id);
  }

  getReferenceId(liveNode) {
    if (!isElementNode(liveNode)) return undefined;

    if (liveNode.ownerDocument !== this.liveDOM) {
      throw new ReferenceError('liveNode doesn\'t belong to connected live document');
    }

    return liveNode.getAttribute(this.options.referenceAttribute);
  }

  getPreviousReferenceId(liveNode) {
    let referenceId;
    let node = liveNode.previousElementSibling;
    while (node) {
      referenceId = this.getReferenceId(node);
      if (referenceId) break;
      node = node.previousElementSibling;
    }

    return referenceId;
  }

  getNextReferenceId(liveNode) {
    let referenceId;
    let node = liveNode.nextElementSibling;
    while (node) {
      referenceId = this.getReferenceId(node);
      if (referenceId) break;
      node = node.nextElementSibling;
    }

    return referenceId;
  }

  getParentReferenceId(liveNode) {
    let referenceId;
    let node = liveNode.parentElement;
    while (node) {
      referenceId = this.getReferenceId(node);
      if (referenceId) break;
      node = node.parentElement;
    }

    return referenceId;
  }

  hasReference(liveNode) {
    return Object.prototype.hasOwnProperty.call(this.referenceMap, this.getReferenceId(liveNode));
  }

  getReference(liveNode) {
    const id = this.getReferenceId(liveNode);
    if (!this.isReferenceId(id)) return undefined;
    return this.referenceMap[id].staticNode;
  }

  setReferenceAttribute(id, attr, value) {
    if (!this.isReferenceId(id)) {
      throw new ReferenceError('reference with specified id is not found');
    }

    const { staticNode } = this.referenceMap[id];
    staticNode.setAttribute(attr, value);
  }

  hasReferenceAttribute(id, attr) {
    if (!this.isReferenceId(id)) {
      throw new ReferenceError('reference with specified id is not found');
    }

    const { staticNode } = this.referenceMap[id];
    return staticNode.hasAttribute(attr);
  }

  removeReferenceAttribute(id, attr) {
    if (!this.isReferenceId(id)) {
      throw new ReferenceError('reference with specified id is not found');
    }

    const { staticNode } = this.referenceMap[id];
    staticNode.removeAttribute(attr);
  }

  removeReference(id) {
    if (!this.isReferenceId(id)) {
      throw new ReferenceError('reference with specified id is not found');
    }

    const { staticNode } = this.referenceMap[id];
    staticNode.parentNode.removeChild(staticNode);
    this.cleanReferenceMap();
  }

  appendReference(liveNode, containerId) {
    if (!this.isReferenceId(containerId)) {
      throw new ReferenceError('reference with specified containerId is not found');
    }

    if (!isNode(liveNode)) {
      throw new TypeError('liveNode is not a Node');
    }

    const staticContainer = this.referenceMap[containerId].staticNode;
    const staticNode = this.composeStaticReference(liveNode);

    staticContainer.appendChild(staticNode);
  }

  insertReferenceBefore(liveNode, siblingId) {
    if (!this.isReferenceId(siblingId)) {
      throw new ReferenceError('reference with specified siblingId is not found');
    }

    if (!isNode(liveNode)) {
      throw new TypeError('liveNode is not a Node');
    }

    const siblingNode = this.referenceMap[siblingId].staticNode;
    const staticNode = this.composeStaticReference(liveNode);

    siblingNode.parentNode.insertBefore(staticNode, siblingNode);
  }

  replaceReference(liveNode, referenceId) {
    if (!this.isReferenceId(referenceId)) {
      throw new ReferenceError('reference with specified referenceId is not found');
    }

    const oldStaticElement = this.referenceMap[referenceId].staticNode;
    const newStaticElement = this.composeStaticReference(liveNode, referenceId);

    oldStaticElement.parentNode.replaceChild(newStaticElement, oldStaticElement);
    this.ejectMutationsFromReferenceOfNode(liveNode);
  }

  ejectMutationsFromReferenceOfNode(liveElement) {
    traverseNode(liveElement, (lNode) => {
      const containerId = this.getReferenceId(lNode);
      const containerNode = this.getReference(lNode);
      const mutations = this.getAdditiveMutationsOfNode(lNode);

      if (isElementNode(containerNode)) {
        containerNode.removeAttribute(this.options.referenceAttribute);
      }

      mutations.forEach((mutation) => {
        switch (mutation.type) {
          case mutationTypes.attributes: {
            const { attributeName, oldValue } = mutation;
            if (oldValue) {
              this.setReferenceAttribute(containerId, attributeName, oldValue);
            } else {
              this.removeReferenceAttribute(containerId, attributeName);
            }
            break;
          }
          case mutationTypes.childList: {
            const {
              addedNodes,
              removedNodes,
              nextSibling,
              previousSibling,
            } = mutation;

            addedNodes.forEach((addedLiveNode) => {
              if (isTextNode(addedLiveNode)) {
                const liveList = Array.prototype.slice.call(addedLiveNode.parentNode.childNodes);
                const liveIndex = liveList.indexOf(addedLiveNode);
                const staticNode = containerNode.childNodes[liveIndex];
                containerNode.removeChild(staticNode);
              }

              const id = this.getReferenceId(addedLiveNode);
              if (!this.isReferenceId(id)) return;
              this.removeReference(id);
              addedLiveNode.removeAttribute(this.options.referenceAttribute);
            });

            removedNodes.forEach((removedLiveNode) => {
              if (isTextNode(removedLiveNode)) {
                const textMutations = this.getAdditiveMutationsOfNode(removedLiveNode);
                const staticNode = removedLiveNode.cloneNode(true);

                textMutations.forEach((textMutation) => {
                  staticNode.nodeValue = textMutation.oldValue;
                });

                if (containerNode.firstChild) {
                  containerNode.insertBefore(staticNode, containerNode.firstChild);
                } else {
                  containerNode.appendChild(staticNode, containerNode.firstChild);
                }
              }
            });
            break;
          }
          default: {
            break;
          }
        }
      });
    });
  }

  addAdditiveMutations(mutations) {
    this.additiveMutations = this.additiveMutations.concat(mutations);
  }

  reduceAdditiveMutationsOfNode(liveNode, types = mutationTypes.all) {
    const additiveMutations = this.getAdditiveMutationsOfNode(liveNode, types);

    additiveMutations.forEach((mutation) => {
      const index = this.additiveMutations.indexOf(mutation);
      this.additiveMutations.splice(index, 1);
      mutation.addedNodes.forEach(node => this.reduceAdditiveMutationsOfNode(node));
      mutation.removedNodes.forEach(node => this.reduceAdditiveMutationsOfNode(node));
    });
  }

  getAdditiveMutationsOfNode(liveNode, types = mutationTypes.all) {
    return this.additiveMutations.filter((mutation) => {
      const sameTarget = mutation.target === liveNode;
      const validType = types.indexOf(mutation.type) > -1;
      return sameTarget && validType;
    });
  }

  conductAttributeMutation(mutation) {
    const liveNode = mutation.target;
    const referenceId = this.getReferenceId(liveNode);
    const attribute = mutation.attributeName;

    if (liveNode.hasAttribute(attribute)) {
      const value = liveNode.getAttribute(attribute);
      this.setReferenceAttribute(referenceId, attribute, value);
    } else {
      this.removeReferenceAttribute(referenceId, attribute);
    }
  }

  conductCharacterDataMutation(mutation) {
    const liveNode = mutation.target.parentNode;
    const referenceId = this.getReferenceId(liveNode);
    this.reduceAdditiveMutationsOfNode(mutation.target, [mutationTypes.characterData]);
    this.replaceReference(liveNode, referenceId);
  }

  conductChildListMutation(mutation) {
    const liveNode = mutation.target;
    const referenceId = this.getReferenceId(liveNode);
    const {
      addedNodes,
      removedNodes,
      nextSibling,
      previousSibling,
    } = mutation;

    // for target.innerHTML or target.replacedChild
    if (addedNodes.length && removedNodes.length && !nextSibling && !previousSibling) {
      this.reduceAdditiveMutationsOfNode(liveNode, [mutationTypes.childList]);
    }

    this.replaceReference(liveNode, referenceId);
  }

  conductMutation(mutation) {
    switch (mutation.type) {
      case mutationTypes.attributes:
        if (!this.hasReference(mutation.target)) return;
        this.conductAttributeMutation(mutation);
        break;
      case mutationTypes.characterData:
        if (!this.hasReference(mutation.target.parentNode)) return;
        this.conductCharacterDataMutation(mutation);
        break;
      default:
        if (!this.hasReference(mutation.target)) return;
        this.conductChildListMutation(mutation);
        break;
    }
  }

  conductTransaction(mutations) {
    const transaction = squashMutations(mutations);
    transaction.forEach(this.conductMutation);
    this.lastTransaction = transaction;
  }
}

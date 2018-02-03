import generateUuid from 'generate-uuid';
import {
  isNode,
  isDocumentNode,
  isElementNode,
  isCommentNode,
  isTextNode,
  isNonEmptyTextNode,
  isChildOfTag,
  getNodeByTreePath,
  getTreePathOfNode,
  traverseNode,
} from 'anodum';

import squashMutations from './squash-mutations';

export default class MutationDriver {
  constructor(options) {
    this.options = {
      referenceAttribute: 'data-uuid',
      forEachReferenceSave: () => {
      },
      ...options,
    };

    this.map = {};
    this.lastConductedMutations = undefined;
    this.conductMutations = this.conductMutations.bind(this);
    this.conductMutation = this.conductMutation.bind(this);
  }

  cleanReferenceMap() {
    const records = Object.keys(this.map);
    records.forEach((id) => {
      const { staticNode } = this.map[id];
      let node = staticNode;

      while (node && !isDocumentNode(node)) {
        if (!node.parentNode) {
          delete this.map[id];
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

  saveReference(liveNode, staticNode) {
    const id = generateUuid();

    if (isElementNode(liveNode)) {
      liveNode.setAttribute(this.options.referenceAttribute, id);
    } else if (isNonEmptyTextNode(liveNode)) {
      const anchor = `${this.options.referenceAttribute}:${id}`;
      const comment = document.createComment(anchor);
      liveNode.parentNode.insertBefore(comment, liveNode);
    }
    this.map[id] = { staticNode };
  }

  composeStaticReference(liveNode) {
    const staticNode = liveNode.cloneNode(true);
    const rootPath = getTreePathOfNode(liveNode);

    traverseNode(liveNode, (lNode, path) => {
      if (isCommentNode(lNode)) return;
      if (isElementNode(lNode) && isChildOfTag(lNode, 'svg')) return;

      path.splice(0, rootPath.length, 0);

      const sNode = getNodeByTreePath(staticNode, path);

      this.saveReference(lNode, sNode);
      this.options.forEachReferenceSave(lNode, sNode);
    }, true);

    return staticNode;
  }

  composeLiveReference(staticNode) {
    if (!isDocumentNode(staticNode) && !isElementNode(staticNode)) {
      throw new TypeError('staticNode is not neither Document nor Element');
    }

    const staticRoot = isDocumentNode(staticNode) ? staticNode : staticNode.ownerDocument;
    const liveNode = staticNode.cloneNode(true);

    traverseNode(liveNode, (lNode, path) => {
      if (isCommentNode(lNode)) return;
      if (isElementNode(lNode) && isChildOfTag(lNode, 'svg')) return;

      const sNode = getNodeByTreePath(staticRoot, path);

      this.saveReference(lNode, sNode);
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

  getLastConductedMutations() {
    return this.lastConductedMutations;
  }

  isReferenceId(id) {
    return Object.prototype.hasOwnProperty.call(this.map, id);
  }

  getReferenceId(liveNode) {
    if (!isElementNode(liveNode) && !isTextNode(liveNode)) return undefined;

    if (liveNode.ownerDocument !== this.liveDOM) {
      throw new ReferenceError('liveNode doesn\'t belong to connected live document');
    }

    if (isTextNode(liveNode)) {
      if (!isCommentNode(liveNode.previousSibling)) return undefined;
      const anchor = liveNode.previousSibling.nodeValue.split(':');
      return anchor[0] === this.options.referenceAttribute ? anchor[1] : undefined;
    }

    return liveNode.getAttribute(this.options.referenceAttribute);
  }

  getPreviousReferenceId(liveNode) {
    let referenceId;
    let node = liveNode.previousSibling;
    while (node) {
      referenceId = this.getReferenceId(node);
      if (referenceId) break;
      node = node.previousSibling;
    }

    return referenceId;
  }

  getNextReferenceId(liveNode) {
    let referenceId;
    let node = liveNode.nextSibling;
    while (node) {
      referenceId = this.getReferenceId(node);
      if (referenceId) break;
      node = node.nextSibling;
    }

    return referenceId;
  }

  getParentReferenceId(liveNode) {
    let referenceId;
    let node = liveNode.parentNode;
    while (node) {
      referenceId = this.getReferenceId(node);
      if (referenceId) break;
      node = node.parentNode;
    }

    return referenceId;
  }

  hasReference(liveNode) {
    return Object.prototype.hasOwnProperty.call(this.map, this.getReferenceId(liveNode));
  }

  getReference(liveNode) {
    const id = this.getReferenceId(liveNode);
    if (!this.isReferenceId(id)) return undefined;
    return this.map[id].staticNode;
  }

  setReferenceAttribute(id, attr, value) {
    if (!this.isReferenceId(id)) {
      throw new ReferenceError('reference with specified id is not found');
    }

    const { staticNode } = this.map[id];

    if (!isElementNode(staticNode)) {
      throw new TypeError('reference is not an Element');
    }

    staticNode.setAttribute(attr, value);
  }

  hasReferenceAttribute(id, attr) {
    if (!this.isReferenceId(id)) {
      throw new ReferenceError('reference with specified id is not found');
    }

    const { staticNode } = this.map[id];

    if (!isElementNode(staticNode)) {
      throw new TypeError('reference is not an Element');
    }

    return staticNode.hasAttribute(attr);
  }

  removeReferenceAttribute(id, attr) {
    if (!this.isReferenceId(id)) {
      throw new ReferenceError('reference with specified id is not found');
    }

    const { staticNode } = this.map[id];

    if (!isElementNode(staticNode)) {
      throw new TypeError('reference is not an Element');
    }

    staticNode.removeAttribute(attr);
  }

  removeReference(id) {
    if (!this.isReferenceId(id)) {
      throw new ReferenceError('reference with specified id is not find');
    }

    const { staticNode } = this.map[id];
    staticNode.parentNode.removeChild(staticNode);
    this.cleanReferenceMap();
  }

  appendReference(liveNode, containerId) {
    if (!this.isReferenceId(containerId)) {
      throw new ReferenceError('reference with specified id is not find');
    }

    if (!isNode(liveNode)) {
      throw new TypeError('liveNode is not a Node');
    }

    const staticContainer = this.map[containerId].staticNode;
    const staticNode = this.composeStaticReference(liveNode);

    staticContainer.appendChild(staticNode);
  }

  insertReferenceBefore(liveNode, siblingId) {
    if (!this.isReferenceId(siblingId)) {
      throw new ReferenceError('reference with specified id is not find');
    }

    if (!isNode(liveNode)) {
      throw new TypeError('liveNode is not a Node');
    }

    const siblingNode = this.map[siblingId].staticNode;
    const staticNode = this.composeStaticReference(liveNode);

    siblingNode.parentNode.insertBefore(staticNode, siblingNode);
  }

  conductAttributeMutation(mutation) {
    if (mutation.type !== 'attributes') {
      throw new TypeError('mutation is not an attribute mutation');
    }

    const liveNode = mutation.target;
    const liveNodeId = this.getReferenceId(liveNode);
    const attribute = mutation.attributeName;

    if (liveNode.hasAttribute(attribute)) {
      const value = liveNode.getAttribute(attribute);
      this.setReferenceAttribute(liveNodeId, attribute, value);
    } else {
      this.removeReferenceAttribute(liveNodeId, attribute);
    }
  }

  conductChildrenRemovalMutation(mutation) {
    if (mutation.type !== 'childList') {
      throw new TypeError('mutation is not an attribute mutation');
    }

    const liveNodes = mutation.removedNodes;

    for (let i = 0; i < liveNodes.length; i += 1) {
      const liveNode = liveNodes[i];
      const liveNodeId = this.getReferenceId(liveNode);
      this.removeReference(liveNodeId);
    }
  }

  conductChildrenInsertionMutation(mutation) {
    if (mutation.type !== 'childList') {
      throw new TypeError('mutation is not an attribute mutation');
    }

    const liveNodes = mutation.addedNodes;

    const container = mutation.target;
    const containerId = this.getReferenceId(container);

    for (let i = 0; i < liveNodes.length; i += 1) {
      const liveNode = liveNodes[i];
      const liveSiblingId = this.getNextReferenceId(liveNode);

      if (liveSiblingId) {
        this.insertReferenceBefore(liveNode, liveSiblingId);
      } else {
        this.appendReference(liveNode, containerId);
      }
    }
  }

  conductChildListMutation(mutation) {
    if (mutation.type !== 'childList') {
      throw new TypeError('mutation is not an attribute mutation');
    }

    if (mutation.removedNodes) {
      this.conductChildrenRemovalMutation(mutation);
    }

    if (mutation.addedNodes) {
      this.conductChildrenInsertionMutation(mutation);
    }
  }

  conductMutation(mutation) {
    if (!this.hasReference(mutation.target)) return;
    switch (mutation.type) {
      case 'attributes': {
        this.conductAttributeMutation(mutation);
        break;
      }
      case 'childList': {
        this.conductChildListMutation(mutation);
        break;
      }
      default: {
        break;
      }
    }
  }

  conductMutations(mutations) {
    const conductedMutations = squashMutations(mutations);
    conductedMutations.forEach(this.conductMutation);
    this.lastConductedMutations = conductedMutations;
  }
}

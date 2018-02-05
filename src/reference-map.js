import generateUuid from 'generate-uuid';
import {
  getNodeByTreePath,
  getTreePathOfNode,
  isDocumentNode,
  isElementNode, isNode,
  traverseNode,
} from 'anodum';


export default class ReferenceMap {
  constructor(options) {
    this.options = {
      referenceAttribute: 'data-uuid',
      forEachReferenceSave: () => {
      },
      ...options,
    };
    this.map = {};
  }

  saveReference(liveNode, staticNode, id = generateUuid()) {
    liveNode.setAttribute(this.options.referenceAttribute, id);
    this.map[id] = { staticNode };
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

  isReferenceId(id) {
    return Object.prototype.hasOwnProperty.call(this.map, id);
  }

  getReferenceId(liveNode) {
    if (!isElementNode(liveNode)) return undefined;
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
    return this.isReferenceId(this.getReferenceId(liveNode));
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
    staticNode.setAttribute(attr, value);
  }

  hasReferenceAttribute(id, attr) {
    if (!this.isReferenceId(id)) {
      throw new ReferenceError('reference with specified id is not found');
    }

    const { staticNode } = this.map[id];
    return staticNode.hasAttribute(attr);
  }

  removeReferenceAttribute(id, attr) {
    if (!this.isReferenceId(id)) {
      throw new ReferenceError('reference with specified id is not found');
    }

    const { staticNode } = this.map[id];
    staticNode.removeAttribute(attr);
  }

  removeReference(id) {
    if (!this.isReferenceId(id)) {
      throw new ReferenceError('reference with specified id is not found');
    }

    const { staticNode } = this.map[id];
    return staticNode.parentNode.removeChild(staticNode);
  }

  appendReference(liveNode, containerId) {
    if (!this.isReferenceId(containerId)) {
      throw new ReferenceError('reference with specified containerId is not found');
    }

    if (!isNode(liveNode)) {
      throw new TypeError('liveNode is not a Node');
    }

    const staticContainer = this.map[containerId].staticNode;
    const staticNode = this.composeStaticReference(liveNode);

    return staticContainer.appendChild(staticNode);
  }

  insertReferenceBefore(liveNode, siblingId) {
    if (!this.isReferenceId(siblingId)) {
      throw new ReferenceError('reference with specified siblingId is not found');
    }

    if (!isNode(liveNode)) {
      throw new TypeError('liveNode is not a Node');
    }

    const siblingNode = this.map[siblingId].staticNode;
    const staticNode = this.composeStaticReference(liveNode);

    return siblingNode.parentNode.insertBefore(staticNode, siblingNode);
  }

  replaceReference(liveNode, referenceId) {
    if (!this.isReferenceId(referenceId)) {
      throw new ReferenceError('reference with specified referenceId is not found');
    }

    const oldStaticElement = this.map[referenceId].staticNode;
    const newStaticElement = this.composeStaticReference(liveNode, referenceId);

    return oldStaticElement.parentNode.replaceChild(newStaticElement, oldStaticElement);
  }

  flush() {
    Object.keys(this.map).forEach((id) => {
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
}

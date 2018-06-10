import {
  getNodeByTreePath,
  getTreePathOfNode,
  isDocumentNode,
  isElementNode,
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
    this.referenceCounter = 1;
  }

  connectStaticDocument(staticDocument) {
    this.staticDocument = staticDocument;
  }

  saveReference(liveNode, staticNode, id) {
    const referenceId = id || `ref_${this.referenceCounter}`;

    if (liveNode.getAttribute(this.options.referenceAttribute) !== referenceId) {
      liveNode.setAttribute(this.options.referenceAttribute, referenceId);
    }

    this.map[referenceId] = { staticNode };
    this.referenceCounter += 1;
    return referenceId;
  }

  composeStaticReference(liveNode) {
    if (!isDocumentNode(liveNode) && !isElementNode(liveNode)) {
      throw new TypeError('liveNode is not neither Document nor Element');
    }

    if (!this.staticDocument) {
      throw new ReferenceError('static document is not connected');
    }

    const staticDOM = this.staticDocument;
    const staticNode = staticDOM.importNode(liveNode, true);
    const rootPath = getTreePathOfNode(liveNode);

    staticNode.removeAttribute(this.options.referenceAttribute);

    traverseNode(liveNode, (lNode, path) => {
      if (!isElementNode(lNode)) return;

      path.splice(0, rootPath.length, 0);

      const sNode = getNodeByTreePath(staticNode, path);
      const id = lNode.getAttribute(this.options.referenceAttribute);

      if (id) {
        this.saveReference(lNode, sNode, id);
      } else {
        this.saveReference(lNode, sNode);
      }

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
      if (!isElementNode(lNode)) return;

      const sNode = getNodeByTreePath(staticRoot, path);
      const id = lNode.getAttribute(this.options.referenceAttribute);

      if (id) {
        this.saveReference(lNode, sNode, id);
      } else {
        this.saveReference(lNode, sNode);
      }

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

  getFirstChildReferenceId(liveNode) {
    let referenceId;
    let node = liveNode.firstElementChild;
    while (node) {
      referenceId = this.getReferenceId(node);
      if (referenceId) break;
      node = node.nextElementSibling;
    }

    return referenceId;
  }

  getLastChildReferenceId(liveNode) {
    let referenceId;
    let node = liveNode.lastElementChild;
    while (node) {
      referenceId = this.getReferenceId(node);
      if (referenceId) break;
      node = node.previousElementSibling;
    }

    return referenceId;
  }

  getChildReferenceId(liveNode, childIndex) {
    let referenceId;
    let index = 0;
    let node = liveNode.firstElementChild;
    while (node) {
      if (this.hasReference(node)) {
        if (index === childIndex) {
          referenceId = this.getReferenceId(node);
          break;
        }

        index += 1;
      }
      node = node.nextElementSibling;
    }

    return referenceId;
  }

  indexOfReferenceId(liveNode, referenceId) {
    let node = liveNode.firstElementChild;
    while (node) {
      if (node.getAttribute(this.options.referenceAttribute) === referenceId) {
        const staticNode = this.getReferenceById(referenceId);
        const nodesList = Array.prototype.slice.call(staticNode.parentNode.childNodes);
        return nodesList.indexOf(staticNode);
      }
      node = node.nextElementSibling;
    }

    return -1;
  }

  hasReference(liveNode) {
    return this.isReferenceId(this.getReferenceId(liveNode));
  }

  getReference(liveNode) {
    const id = this.getReferenceId(liveNode);
    return this.getReferenceById(id);
  }

  getReferenceById(id) {
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
    staticNode.parentNode.removeChild(staticNode);
    delete this.map[id];

    return staticNode;
  }

  appendReference(liveNode, containerId) {
    if (!this.isReferenceId(containerId)) {
      throw new ReferenceError('reference with specified containerId is not found');
    }

    const staticContainer = this.map[containerId].staticNode;
    const staticNode = this.composeStaticReference(liveNode);

    staticContainer.appendChild(staticNode);

    return staticNode;
  }

  insertReferenceBefore(liveNode, siblingId) {
    if (!this.isReferenceId(siblingId)) {
      throw new ReferenceError('reference with specified siblingId is not found');
    }

    const siblingNode = this.map[siblingId].staticNode;
    const staticNode = this.composeStaticReference(liveNode);

    siblingNode.parentNode.insertBefore(staticNode, siblingNode);

    return staticNode;
  }

  replaceReference(liveNode, referenceId) {
    if (!this.isReferenceId(referenceId)) {
      throw new ReferenceError('reference with specified referenceId is not found');
    }

    const oldStaticElement = this.map[referenceId].staticNode;
    const newStaticElement = this.composeStaticReference(liveNode, referenceId);

    oldStaticElement.parentNode.replaceChild(newStaticElement, oldStaticElement);

    return newStaticElement;
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

  unbind(liveNode) {
    if (!isElementNode(liveNode)) return;
    liveNode.removeAttribute(this.options.referenceAttribute);
  }
}

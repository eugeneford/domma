import generateUuid from 'generate-uuid';
import {
  isDocumentNode,
  isElementNode,
  isChildOfTag,
  getNodeByTreePath,
  traverseNode,
} from 'anodum';

import squashMutations from './squash-mutations';

export default class MutationDriver {
  constructor(options) {
    this.options = {
      bindAttribute: 'data-uuid',
      forEachElementBind: () => {
      },
      ...options,
    };

    this.map = {};
    this.lastConductedMutations = undefined;
    this.conductMutations = this.conductMutations.bind(this);
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

  composeLiveNode(staticNode) {
    if (!isDocumentNode(staticNode) && !isElementNode(staticNode)) {
      throw new TypeError('staticNode is not neither Document nor Element');
    }

    const staticRoot = isDocumentNode(staticNode) ? staticNode : staticNode.ownerDocument;
    const liveNode = staticNode.cloneNode(true);

    traverseNode(liveNode, (lNode, path) => {
      if (!isElementNode(lNode)) return;
      if (isChildOfTag(lNode, 'svg')) return;

      const sNode = getNodeByTreePath(staticRoot, path);
      const id = generateUuid();

      lNode.setAttribute(this.options.bindAttribute, id);
      this.map[id] = { staticElement: sNode };

      this.options.forEachElementBind(lNode);
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

  getReferenceId(liveElement) {
    if (!isElementNode(liveElement)) {
      throw new TypeError('liveElement is not an Element node');
    }

    if (liveElement.ownerDocument !== this.liveDOM) {
      throw new ReferenceError('liveElement doesn\'t belong to connected live document');
    }

    return liveElement.getAttribute(this.options.bindAttribute);
  }

  hasReference(liveElement) {
    return Object.prototype.hasOwnProperty.call(this.map, this.getReferenceId(liveElement));
  }

  getReference(liveElement) {
    const id = this.getReferenceId(liveElement);
    if (!this.isReferenceId(id)) return undefined;
    return this.map[id].staticElement;
  }

  conductMutation(mutation) {
    console.log(this.getReference(mutation.target));
  }

  conductMutations(mutations) {
    const conductedMutations = squashMutations(mutations);
    conductedMutations.forEach(this.conductMutation);
    this.lastConductedMutations = conductedMutations;
  }
}

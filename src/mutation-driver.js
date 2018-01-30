import generateUuid from 'generate-uuid';

import {
  isDocumentNode,
  isElementNode,
  isChildOfTag,
  getNodeByTreePath,
  traverseNode,
} from 'anodum';

export default class MutationDriver {
  constructor(options) {
    this.options = {
      bindAttribute: 'data-uuid',
      forEachElementBind: () => {
      },
      ...options,
    };

    this.map = {};

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

  getReferenceId(liveElement) {
    if (!isElementNode(liveElement)) {
      throw new TypeError('liveElement is not an Element');
    }

    return liveElement.getAttribute(this.options.bindAttribute);
  }

  hasReference(liveElement) {
    return this.map.hasOwnProperty(this.getReferenceId(liveElement));
  }

  getReference(liveElement) {
    if (!this.hasReference(liveElement)) return;
    return this.map[this.getReferenceId(liveElement)].staticElement;
  }

  squashMutations(mutations){
    const filtered = [];

    mutations.reverse().forEach((mutation) => {
      switch (mutation.type) {
        case 'attributes':
          const filteredMutation = filtered.find((mut) => {
            return mut.target === mutation.target && mut.attributeName === mutation.attributeName;
          });

          if (!filteredMutation) filtered.push(mutation);
          break;
        default:
          filtered.push(mutation);
      }
    });

    return filtered;
  }

  conductMutations(rawMutations) {
    const mutations = this.squashMutations(rawMutations);

    console.log(mutations);

    this.squashMutations(mutations).forEach((mutation) => {
      console.log(this.getReference(mutation.target));
    });
  }
}

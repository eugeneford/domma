export default function (rawMutations) {
  const mutations = [];

  rawMutations.reverse().forEach((rawMutation) => {
    switch (rawMutation.type) {
      case 'attributes': {
        const prioritizedMutation = mutations.find((mutation) => {
          const isSameTarget = mutation.target === rawMutation.target;
          const isSameAttribute = mutation.attributeName === rawMutation.attributeName;
          return isSameTarget && isSameAttribute;
        });

        if (!prioritizedMutation) mutations.unshift(rawMutation);
        break;
      }
      default: {
        mutations.push(rawMutation);
      }
    }
  });

  return mutations.reverse();
}

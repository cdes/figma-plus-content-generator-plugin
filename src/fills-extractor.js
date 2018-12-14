let paints = [];

function until(conditionFunction) {

  const poll = resolve => {
    if(conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 10);
  };

  return new Promise(poll);
}

function arrayToHex(array) {
  return array.reduce(function(memo, i) { return memo + ('0'+i.toString(16)).slice(-2); }, '');
}

const getFill = async (nodeId) => {
  window.App.sendMessage('clearSelection');
  await until(() => !window.App._state.mirror.selectionProperties.fillPaints);
  window.App.sendMessage('addToSelection', { nodeIds: [nodeId] });
  await until(() => fillPaintsIsReady(window.App._state.mirror.selectionProperties.fillPaints));
  let hashArray = window.App._state.mirror.selectionProperties.fillPaints[0].image.hash;
  let hash = arrayToHex(hashArray);
  window.App.sendMessage('clearSelection');
  paints.push(hash);
  return(hash);
};

const fillPaintsIsReady = (fillPaints) => {
  return (
    fillPaints
    && !fillPaints.__mixed__
    && fillPaints[0]
    && fillPaints[0].image
    && Object.prototype.toString.call(fillPaints[0].image.hash) === '[object Uint8Array]'
  );
};

const getAllPaints = async() => {
  let selected = Object.keys(window.App._state.mirror.sceneGraphSelection);

  for (const node of selected) {
    await getFill(node);
  }

  let newPaints = paints.map(item => ({
    type: item.type,
    opacity: item.opacity,
    visible: item.visible,
    blendMode: item.blendMode,
    image: {
      hash: Object.values(item.image.hash),
      name: item.image.name
    },
    imageThumbnail: {
      hash: Object.values(item.imageThumbnail.hash),
      name: item.image.name
    },
    imageScaleMode: item.imageScaleMode,
    rotation: item.rotation,
    scale: item.scale,
  }));

  // eslint-disable-next-line no-console
  console.log(newPaints);
};

getAllPaints();

let paints = [];

function until(conditionFunction) {

  const poll = resolve => {
    if(conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 10);
  };

  return new Promise(poll);
}

const getFill = async (nodeId) => {
  window.App.sendMessage('clearSelection');
  await until(() => !window.App._state.mirror.selectionProperties.fillPaints);
  window.App.sendMessage('addToSelection', { nodeIds: [nodeId] });
  await until(() => window.App._state.mirror.selectionProperties.fillPaints && !window.App._state.mirror.selectionProperties.fillPaints.__mixed__);
  let fillPaints = window.App._state.mirror.selectionProperties.fillPaints;
  window.App.sendMessage('clearSelection');
  paints.push(fillPaints[0]);
  return(fillPaints[0]);
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

import { getRandom, toast, until, toggleLoading, createLoading } from './utilities';
import { getMenFaces, getWomenFaces } from './api';

class ContentGenerator {
  constructor() {
    this.name = 'Content Generator';
    this.id = 'contentGenerator',
    this.state = {
      menFaces: [],
      womenFaces: [],
    };

    this.loading = createLoading();
  }

  getRandomMenFaces = (count) => {
    return new Promise((resolve) => {
      if(this.state.menFaces.length === 0) {
        getMenFaces().then((menFaces) => {
          this.state.menFaces = menFaces;
          resolve(getRandom(menFaces, count));
        });
      }
      else {
        resolve(getRandom(this.state.menFaces, count % 99));
      }
    });
  }

  getRandomWomenFaces = (count) => {
    return new Promise((resolve) => {
      if(this.state.womenFaces.length === 0) {
        getWomenFaces().then((womenFaces) => {
          this.state.womenFaces = womenFaces;
          resolve(getRandom(womenFaces, count));
        });
      }
      else {
        resolve(getRandom(this.state.womenFaces, count % 99));
      }
    });
  }

  fillMenFaces = () => {
    const selectedNodes = Object.keys(window.App._state.mirror.sceneGraphSelection);

    if (selectedNodes.length === 0) {
      toast('You must select at least one layer.');
      return;
    }

    this.getRandomMenFaces(selectedNodes.length).then(async faces => {
      toggleLoading(true);
      await this.addFillToSelectedLayers(selectedNodes, faces);
      toggleLoading(false);
    });
  }

  fillWomenFaces = () => {
    const selectedNodes = Object.keys(window.App._state.mirror.sceneGraphSelection);

    if (selectedNodes.length === 0) {
      toast('You must select at least one layer.');
      return;
    }

    this.getRandomWomenFaces(selectedNodes.length).then(async faces => {
      toggleLoading(true);
      await this.addFillToSelectedLayers(selectedNodes, faces);
      toggleLoading(false);
    });
  }

  addFillToSelectedLayers = async (selectedNodes, fills) => {

    for (const [index, node] of selectedNodes.entries()) {
      window.App.sendMessage('clearSelection');
      await until(() => !window.App._state.mirror.selectionProperties.fillPaints);
      window.App.sendMessage('addToSelection', { nodeIds: [node] });
      await until(() => window.App._state.mirror.selectionProperties.fillPaints && !window.App._state.mirror.selectionProperties.fillPaints.__mixed__);
      const currentFill = window.App._state.mirror.selectionProperties.fillPaints;
      const cappedIndex = index % (fills.length);
      const newFill = fills[cappedIndex];

      window.App.updateSelectionProperties({
        fillPaints: [...currentFill, newFill]
      });
      window.App.sendMessage('clearSelection');
    }
  }
}

const contentGeneratorPlugin = new ContentGenerator();

const options = [
  'Fill Faces',
  () => {},
  null,
  null,
  [
    {
      itemLabel: 'Men',
      triggerFunction: contentGeneratorPlugin.fillMenFaces.bind(contentGeneratorPlugin),
      condition: null,
      shortcut: null,
    },
    {
      itemLabel: 'Women',
      triggerFunction: contentGeneratorPlugin.fillWomenFaces.bind(contentGeneratorPlugin),
      condition: null,
      shortcut: null,
    },
  ],
];

window.figmaPlugin.createPluginsMenuItem(...options);
window.figmaPlugin.createContextMenuItem.Selection(...options);
window.figmaPlugin.createContextMenuItem.ObjectsPanel(...options);

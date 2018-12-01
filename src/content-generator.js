import { getRandom, toast } from "./utilities";
import { getMenFaces, getWomenFaces, getPersons, getPersonsMale, getPersonsFemale } from "./api";

class ContentGenerator {
  constructor() {
    this.name = 'Content Generator';
    this.id = 'contentGenerator',
    this.state = {
      menFaces: [],
      womenFaces: [],
    }
  }
  
  getRandomMenFaces = (count) => {
    return new Promise((resolve, reject) => {
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
    return new Promise((resolve, reject) => {
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
    const selectedNodes = Object.keys(App._state.mirror.sceneGraphSelection);
    
    if (selectedNodes.length === 0) {
      toast('You must select at least one layer.');
      return;
    }
    
    this.getRandomMenFaces(selectedNodes.length).then(faces => {
      this.addFillToSelectedLayer(selectedNodes, faces);
    });
  }

  fillWomenFaces = () => {
    const selectedNodes = Object.keys(App._state.mirror.sceneGraphSelection);
    
    if (selectedNodes.length === 0) {
      toast('You must select at least one layer.');
      return;
    }
    
    this.getRandomWomenFaces(selectedNodes.length).then(faces => {
      this.addFillToSelectedLayer(selectedNodes, faces);
    });
  }
  
  addFillToSelectedLayer = (selectedNodes, fills) => {
    selectedNodes.map((node, index) => {
      App.sendMessage('clearSelection');
      App.sendMessage('addToSelection', { nodeIds: [node] });

      const currentFill = App._state.mirror.selectionProperties.fillPaints;
      const cappedIndex = index % (fills.length);
      const newFill = fills[cappedIndex];

      App.updateSelectionProperties({
        fillPaints: [...currentFill, newFill]
      })
      App.sendMessage('clearSelection');
    })
  }
}

const contentGeneratorPlugin = new ContentGenerator();

const options = [
  "Fill Faces",
  () => {},
  null,
  [
    {
      itemLabel: "Men",
      triggerFunction: contentGeneratorPlugin.fillMenFaces.bind(contentGeneratorPlugin),
    },
    {
      itemLabel: "Women",
      triggerFunction: contentGeneratorPlugin.fillWomenFaces.bind(contentGeneratorPlugin),
    },
  ],
];

const menuItems = [
  {
    title: "Generate: Men Faces",
    trigger: contentGeneratorPlugin.fillMenFaces.bind(contentGeneratorPlugin),
  },
  {
    title: "Generate: Women Faces",
    trigger: contentGeneratorPlugin.fillWomenFaces.bind(contentGeneratorPlugin),
  },
];

menuItems.map(item => {
  window.figmaPlugin.createPluginsMenuItem(item.title, item.trigger);
  window.figmaPlugin.createContextMenuItem.Selection(item.title, item.trigger);
  window.figmaPlugin.createContextMenuItem.ObjectsPanel(item.title, item.trigger);
});
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
        })
      }
      else {
        resolve(getRandom(this.state.menFaces, count));
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
      console.log("resolved", faces);
      selectedNodes.map((node, index) => {
        setTimeout(()=> {
          App.sendMessage('clearSelection');
          App.sendMessage('addToSelection', { nodeIds: [node] });
          const fillPaints = App._state.mirror.selectionProperties.fillPaints;
          this.addFillToSelectedLayer(fillPaints, faces[index % 99]);
          }, 1000 + (index * 250));
      })
    });
  }
  
  addFillToSelectedLayer = (currentFill, newFill) => {  
    App.updateSelectionProperties({
      fillPaints: [...currentFill, newFill]
    })
    App.sendMessage('clearSelection');
  }
}

const contentGeneratorPlugin = new ContentGenerator();

const options = [
  contentGeneratorPlugin.name,
  contentGeneratorPlugin.fillMenFaces.bind(contentGeneratorPlugin)
];

window.figmaPlugin.createPluginsMenuItem(...options);
window.figmaPlugin.createContextMenuItem.Canvas(...options);
window.figmaPlugin.createContextMenuItem.ObjectsPanel(...options);
import {
  getRandom,
  until,
  toggleLoading,
  createLoading,
  hexToArray
} from './utilities';
import { getMenFaces, getWomenFaces, getPersons, getPersonsMale, getPersonsFemale } from './api';
import { textTransform } from 'text-transform';

class ContentGenerator {
  constructor() {
    this.name = 'Content Generator';
    this.nation = 'us';
    (this.id = 'contentGenerator'),
    (this.state = {
      menFaces: [],
      womenFaces: [],
    });

    this.loading = createLoading();

    this.showToast = window.figmaPlus.showToast;
  }

  getRandomData = (count, gender) => {
    return new Promise(resolve => {
      if(gender === 'male') {
        getPersonsMale(count, this.nation).then(data => {
          resolve(data.results);
        });
      }
      else if(gender === 'female') {
        getPersonsFemale(count, this.nation).then(data => {
          resolve(data.results);
        });
      }
      else {
        getPersons(count, this.nation).then(data => {
          resolve(data.results);
        });
      }
    });
  };

  getRandomMenFaces = count => {
    return new Promise(resolve => {
      if (this.state.menFaces.length < count) {
        getMenFaces().then(menFaces => {
          this.state.menFaces = menFaces;
          resolve(getRandom(menFaces, count));
        });
      } else {
        resolve(getRandom(this.state.menFaces, count % 99));
      }
    });
  };

  getRandomWomenFaces = count => {
    return new Promise(resolve => {
      if (this.state.womenFaces.length < count) {
        getWomenFaces().then(womenFaces => {
          this.state.womenFaces = womenFaces;
          resolve(getRandom(womenFaces, count));
        });
      } else {
        resolve(getRandom(this.state.womenFaces, count % 99));
      }
    });
  };

  fillMenFaces = () => {
    const selectedNodes = Object.keys(
      window.App._state.mirror.sceneGraphSelection
    );

    if (selectedNodes.length === 0) {
      this.showToast('⚠️ You must select at least one layer.');
      return;
    }

    this.getRandomMenFaces(selectedNodes.length).then(async faces => {
      toggleLoading(true);
      await this.addFillToSelectedLayers(selectedNodes, faces);
      toggleLoading(false);
      this.showToast('✅ Filled, wait a bit for images to load');
    });
  };

  fillWomenFaces = () => {
    const selectedNodes = Object.keys(
      window.App._state.mirror.sceneGraphSelection
    );

    if (selectedNodes.length === 0) {
      this.showToast('⚠️ You must select at least one layer.', 5);
      return;
    }

    this.getRandomWomenFaces(selectedNodes.length).then(async faces => {
      toggleLoading(true);
      await this.addFillToSelectedLayers(selectedNodes, faces);
      toggleLoading(false);
      this.showToast('✅ Filled, wait a bit for images to load', 5);
    });
  };

  addFillToSelectedLayers = async (selectedNodes, fills) => {
    for (const [index, node] of selectedNodes.entries()) {
      window.App.sendMessage('clearSelection');
      await until(
        () => !window.App._state.mirror.selectionProperties.fillPaints
      );
      window.App.sendMessage('addToSelection', { nodeIds: [node] });
      await until(
        () =>
          window.App._state.mirror.selectionProperties.fillPaints &&
          !window.App._state.mirror.selectionProperties.fillPaints.__mixed__
      );
      const currentFill =
        window.App._state.mirror.selectionProperties.fillPaints;
      const cappedIndex = index % fills.length;
      const newFill = fills[cappedIndex];
      await window.App.imagePasteManager.allowDownloadForPastedImages(
        'FpQcUjJJ8y6hNoMBDMRUUo7n',
        window.App._state.editingFileKey,
        [newFill]
      );

      window.App.updateSelectionProperties({
        fillPaints: [...currentFill, newFill]
      });
      window.App.updateSelectionProperties({
        fillPaints: [
          ...currentFill,
          {
            type: 'IMAGE',
            blendMode: 'NORMAL',
            imageScaleMode: 'FILL',
            opacity: 1,
            image: {
              hash: hexToArray(newFill),
              name: 'image'
            }
          }
        ]
      });
      window.App.sendMessage('clearSelection');
    }
  };

  fillMenNames = () => {
    this.fillData('Men Names');
  };

  fillWomenNames = () => {
    this.fillData('Women Names');
  };

  fillEmails = () => {
    this.fillData('Emails');
  };

  fillCity = () => {
    this.fillData('City');
  };

  fillUsername = () => {
    this.fillData('Username');
  };

  fillCoordinates = () => {
    this.fillData('Coordinates');
  };

  fillData = type => {
    const selectedNodes = Object.keys(
      window.App._state.mirror.sceneGraphSelection
    );

    if (selectedNodes.length === 0) {
      this.showToast('⚠️ You must select at least one layer.');
      return;
    }

    let gender;

    if(type === 'Men Names') {
      gender = 'male';
    }
    else if(type === 'Women Names') {
      gender = 'female';
    }

    this.getRandomData(selectedNodes.length, gender).then(async items => {
      toggleLoading(true);

      let filteredItems;

      switch (type) {
      case 'Men Names':
        filteredItems = items.map(item =>
          textTransform(`${item.name.first} ${item.name.last}`, 'capitalize')
        );
        break;
      case 'Women Names':
        filteredItems = items.map(item =>
          textTransform(`${item.name.first} ${item.name.last}`, 'capitalize')
        );
        break;
      case 'Emails':
        filteredItems = items.map(item => item.email);
        break;
      case 'City':
        filteredItems = items.map(
          item => `${textTransform(item.location.city, 'capitalize')}`
        );
        break;
      case 'Username':
        filteredItems = items.map(item => item.login.username);
        break;
      case 'Coordinates':
        filteredItems = items.map(
          item =>
            `${item.location.coordinates.longitude}, ${
              item.location.coordinates.latitude
            } `
        );
        break;
      default:
        break;
      }

      await this.setLayersText(selectedNodes, filteredItems);
      toggleLoading(false);
      this.showToast('✅ Filled');
    });
  };

  setLayersText = async (selectedNodes, filteredItems) => {
    for (const [index, nodeId] of selectedNodes.entries()) {
      const node = window.figmaPlus.getNodeById(nodeId);
      if (node.type === 'TEXT') {
        node.characters = filteredItems[index];
      }
    }
  };

  setUSNation = () => {
    this.nation = 'us';
  }

  setBRNation = () => {
    this.nation = 'br';
  };
}

const contentGeneratorPlugin = new ContentGenerator();

const menuItems = [
  {
    label: 'Fill Faces',
    action: () => {},
    submenu: [
      {
        label: 'Men',
        action: contentGeneratorPlugin.fillMenFaces.bind(
          contentGeneratorPlugin
        ),
      },
      {
        label: 'Women',
        action: contentGeneratorPlugin.fillWomenFaces.bind(
          contentGeneratorPlugin
        ),
      }
    ],
    showInCanvasMenu: true,
    showInSelectionMenu: true,
  },
  {
    label: 'Fill Data',
    action: () => {},
    submenu: [
      {
        label: 'Men Names',
        action: contentGeneratorPlugin.fillMenNames.bind(
          contentGeneratorPlugin
        ),
      },
      {
        label: 'Women Names',
        action: contentGeneratorPlugin.fillWomenNames.bind(
          contentGeneratorPlugin
        ),
      },
      {
        label: 'Emails',
        action: contentGeneratorPlugin.fillEmails.bind(
          contentGeneratorPlugin
        ),
      },

      {
        label: 'Usernames',
        action: contentGeneratorPlugin.fillUsername.bind(
          contentGeneratorPlugin
        ),
      },
      {
        label: 'Coordinates',
        action: contentGeneratorPlugin.fillCoordinates.bind(
          contentGeneratorPlugin
        ),
      },
      {
        label: 'Cities',
        action: contentGeneratorPlugin.fillCity.bind(
          contentGeneratorPlugin
        ),
      }
    ],
    showInCanvasMenu: true,
    showInSelectionMenu: true,
  },
  {
    label: 'Change Nation',
    action: () => {},
    submenu: [
      {
        // default
        label: 'United States',
        action: contentGeneratorPlugin.setUSNation.bind(
          contentGeneratorPlugin
        ),
      },
      {
        label: 'Brazil',
        action: contentGeneratorPlugin.setBRNation.bind(
          contentGeneratorPlugin
        ),
      },
    ],
    showInCanvasMenu: true,
    showInSelectionMenu: true,
  }
];

menuItems.map(item => {
  window.figmaPlus.addCommand(item);
});

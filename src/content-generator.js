import {
  getRandom,
  until,
  toggleLoading,
  createLoading,
  hexToArray
} from './utilities';
import { getMenFaces, getWomenFaces, getPersons } from './api';
import { textTransform } from 'text-transform';

class ContentGenerator {
  constructor() {
    this.name = 'Content Generator';
    (this.id = 'contentGenerator'),
    (this.state = {
      menFaces: [],
      womenFaces: [],
      data: []
    });

    this.loading = createLoading();

    this.showToast = window.figmaPlugin.showToast;
  }

  getRandomData = count => {
    return new Promise(resolve => {
      if (this.state.data.length < count) {
        getPersons(count).then(data => {
          this.state.data = data.results;
          resolve(data.results);
        });
      } else {
        resolve(this.state.data);
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
      this.showToast('You must select at least one layer.');
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

  fillNames = () => {
    this.fillData('Names');
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

    this.getRandomData(selectedNodes.length).then(async items => {
      toggleLoading(true);

      let filteredItems;

      switch (type) {
      case 'Names':
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
      const node = window.figmaPlugin.getNode(nodeId);
      if (node.type === 'TEXT') {
        node.characters = filteredItems[index];
      }
    }
  };
}

const contentGeneratorPlugin = new ContentGenerator();

const menuItems = [
  [
    'Fill Faces',
    () => {},
    null,
    null,
    [
      {
        itemLabel: 'Men',
        triggerFunction: contentGeneratorPlugin.fillMenFaces.bind(
          contentGeneratorPlugin
        ),
        condition: null,
        shortcut: null
      },
      {
        itemLabel: 'Women',
        triggerFunction: contentGeneratorPlugin.fillWomenFaces.bind(
          contentGeneratorPlugin
        ),
        condition: null,
        shortcut: null
      }
    ]
  ],
  [
    'Fill Data',
    () => {},
    null,
    null,
    [
      {
        itemLabel: 'Names',
        triggerFunction: contentGeneratorPlugin.fillNames.bind(
          contentGeneratorPlugin
        ),
        condition: null,
        shortcut: null
      },
      {
        itemLabel: 'Emails',
        triggerFunction: contentGeneratorPlugin.fillEmails.bind(
          contentGeneratorPlugin
        ),
        condition: null,
        shortcut: null
      },

      {
        itemLabel: 'Usernames',
        triggerFunction: contentGeneratorPlugin.fillUsername.bind(
          contentGeneratorPlugin
        ),
        condition: null,
        shortcut: null
      },
      {
        itemLabel: 'Coordinates',
        triggerFunction: contentGeneratorPlugin.fillCoordinates.bind(
          contentGeneratorPlugin
        ),
        condition: null,
        shortcut: null
      },
      {
        itemLabel: 'Cities',
        triggerFunction: contentGeneratorPlugin.fillCity.bind(
          contentGeneratorPlugin
        ),
        condition: null,
        shortcut: null
      }
    ]
  ]
];

menuItems.map(item => {
  window.figmaPlugin.createPluginsMenuItem(...item);
  window.figmaPlugin.createContextMenuItem.Selection(...item);
  window.figmaPlugin.createContextMenuItem.ObjectsPanel(...item);
});

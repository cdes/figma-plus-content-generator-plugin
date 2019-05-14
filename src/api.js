export const getMenFaces = () => {
  return loadXHR('https://cdn.jsdelivr.net/gh/cdes/figma-content-generator-plugin@0.50.5/dist/data/men-faces.json');
};

export const getWomenFaces = () => {
  return loadXHR('https://cdn.jsdelivr.net/gh/cdes/figma-content-generator-plugin@0.50.5/dist/data/women-faces.json');
};

export const getPersons = (count, nation) => {
  return loadXHR(`https://randomuser.me/api/?results=${count}&nat=${nation}`);
};

export const getPersonsMale = (count, nation) => {
  return loadXHR(`https://randomuser.me/api/?results=${count}&?gender=male&nat=${nation}`);
};

export const getPersonsFemale = (count, nation) => {
  return loadXHR(`https://randomuser.me/api/?results=${count}&?gender=female&nat=${nation}`);
};

function loadXHR(url) {
  return new Promise(function(resolve, reject) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'json';
      xhr.onerror = function() {reject('Network error.');};
      xhr.onload = function() {
        if (xhr.status === 200) {resolve(xhr.response);}
        else {reject('Loading error:' + xhr.statusText);}
      };
      xhr.send();
    }
    catch(err) {reject(err.message);}
  });
}

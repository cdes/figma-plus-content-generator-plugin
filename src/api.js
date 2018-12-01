export const getMenFaces = () => {
    return loadXHR("https://cdes.github.io/figma-content-generator-plugin/dist/men-faces.json");
}

export const getWomenFaces = () => {
    return loadXHR("https://cdes.github.io/figma-content-generator-plugin/dist/women-faces.json");
}

export const getPersons = (count) => {
    return loadXHR(`https://randomuser.me/api/?results=${count}`);
}

export const getPersonsMale = (count) => {
    return loadXHR(`https://randomuser.me/api/?results=${count}&?gender=male`);
}

export const getPersonsFemale = (count) => {
    return loadXHR(`https://randomuser.me/api/?results=${count}&?gender=female`);
}

function loadXHR(url) {
    return new Promise(function(resolve, reject) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = "json";
            xhr.onerror = function() {reject("Network error.")};
            xhr.onload = function() {
                if (xhr.status === 200) {resolve(xhr.response)}
                else {reject("Loading error:" + xhr.statusText)}
            };
            xhr.send();
        }
        catch(err) {reject(err.message)}
    });
}

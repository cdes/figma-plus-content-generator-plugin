// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"utilities.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toast = exports.getRandom = void 0;

var getRandom = function getRandom(arr, n) {
  var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
  if (n > len) throw new RangeError("getRandom: more elements taken than available");

  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }

  return result;
};

exports.getRandom = getRandom;

var toast = function toast(message) {
  App._store.dispatch({
    type: "VISUAL_BELL_ENQUEUE",
    payload: {
      message: message || ""
    }
  });
};

exports.toast = toast;
},{}],"api.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPersonsFemale = exports.getPersonsMale = exports.getPersons = exports.getWomenFaces = exports.getMenFaces = void 0;

var getMenFaces = function getMenFaces() {
  return loadXHR("https://cdes.github.io/cdes/figma-content-generator-plugin/dist/men-faces.json");
};

exports.getMenFaces = getMenFaces;

var getWomenFaces = function getWomenFaces() {
  return loadXHR("https://cdes.github.io/cdes/figma-content-generator-plugin/dist/women-faces.json");
};

exports.getWomenFaces = getWomenFaces;

var getPersons = function getPersons(count) {
  return loadXHR("https://randomuser.me/api/?results=".concat(count));
};

exports.getPersons = getPersons;

var getPersonsMale = function getPersonsMale(count) {
  return loadXHR("https://randomuser.me/api/?results=".concat(count, "&?gender=male"));
};

exports.getPersonsMale = getPersonsMale;

var getPersonsFemale = function getPersonsFemale(count) {
  return loadXHR("https://randomuser.me/api/?results=".concat(count, "&?gender=female"));
};

exports.getPersonsFemale = getPersonsFemale;

function loadXHR(url) {
  return new Promise(function (resolve, reject) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "json";

      xhr.onerror = function () {
        reject("Network error.");
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject("Loading error:" + xhr.statusText);
        }
      };

      xhr.send();
    } catch (err) {
      reject(err.message);
    }
  });
}
},{}],"content-generator.js":[function(require,module,exports) {
"use strict";

var _utilities = require("./utilities");

var _api = require("./api");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ContentGenerator = function ContentGenerator() {
  var _this = this;

  _classCallCheck(this, ContentGenerator);

  this.getRandomMenFaces = function (count) {
    return new Promise(function (resolve, reject) {
      if (_this.state.menFaces.length === 0) {
        (0, _api.getMenFaces)().then(function (menFaces) {
          _this.state.menFaces = menFaces;
          resolve((0, _utilities.getRandom)(menFaces, count));
        });
      } else {
        resolve((0, _utilities.getRandom)(_this.state.menFaces, count % 99));
      }
    });
  };

  this.getRandomWomenFaces = function (count) {
    return new Promise(function (resolve, reject) {
      if (_this.state.womenFaces.length === 0) {
        (0, _api.getWomenFaces)().then(function (womenFaces) {
          _this.state.womenFaces = womenFaces;
          resolve((0, _utilities.getRandom)(womenFaces, count));
        });
      } else {
        resolve((0, _utilities.getRandom)(_this.state.womenFaces, count % 99));
      }
    });
  };

  this.fillMenFaces = function () {
    var selectedNodes = Object.keys(App._state.mirror.sceneGraphSelection);

    if (selectedNodes.length === 0) {
      (0, _utilities.toast)('You must select at least one layer.');
      return;
    }

    _this.getRandomMenFaces(selectedNodes.length).then(function (faces) {
      _this.addFillToSelectedLayer(selectedNodes, faces);
    });
  };

  this.fillWomenFaces = function () {
    var selectedNodes = Object.keys(App._state.mirror.sceneGraphSelection);

    if (selectedNodes.length === 0) {
      (0, _utilities.toast)('You must select at least one layer.');
      return;
    }

    _this.getRandomWomenFaces(selectedNodes.length).then(function (faces) {
      _this.addFillToSelectedLayer(selectedNodes, faces);
    });
  };

  this.addFillToSelectedLayer = function (selectedNodes, fills) {
    selectedNodes.map(function (node, index) {
      App.sendMessage('clearSelection');
      App.sendMessage('addToSelection', {
        nodeIds: [node]
      });
      var currentFill = App._state.mirror.selectionProperties.fillPaints;
      var cappedIndex = index % fills.length;
      var newFill = fills[cappedIndex];
      App.updateSelectionProperties({
        fillPaints: _toConsumableArray(currentFill).concat([newFill])
      });
      App.sendMessage('clearSelection');
    });
  };

  this.name = 'Content Generator';
  this.id = 'contentGenerator', this.state = {
    menFaces: [],
    womenFaces: []
  };
};

var contentGeneratorPlugin = new ContentGenerator();
var options = ["Fill Faces", function () {}, null, [{
  itemLabel: "Men",
  triggerFunction: contentGeneratorPlugin.fillMenFaces.bind(contentGeneratorPlugin)
}, {
  itemLabel: "Women",
  triggerFunction: contentGeneratorPlugin.fillWomenFaces.bind(contentGeneratorPlugin)
}]];
var menuItems = [{
  title: "Generate: Men Faces",
  trigger: contentGeneratorPlugin.fillMenFaces.bind(contentGeneratorPlugin)
}, {
  title: "Generate: Women Faces",
  trigger: contentGeneratorPlugin.fillWomenFaces.bind(contentGeneratorPlugin)
}];
menuItems.map(function (item) {
  window.figmaPlugin.createPluginsMenuItem(item.title, item.trigger);
  window.figmaPlugin.createContextMenuItem.Selection(item.title, item.trigger);
  window.figmaPlugin.createContextMenuItem.ObjectsPanel(item.title, item.trigger);
});
},{"./utilities":"utilities.js","./api":"api.js"}],"index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _contentGenerator = _interopRequireDefault(require("./content-generator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _contentGenerator.default;
exports.default = _default;
},{"./content-generator":"content-generator.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63851" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/content-generator.map
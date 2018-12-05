export const getRandom = (arr, n) => {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError('getRandom: more elements taken than available');
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
};

export const toast = (message) => {
  window.App._store.dispatch({
    type: 'VISUAL_BELL_ENQUEUE',
    payload: {
      message: message || ''
    }
  });
};

export const until = (conditionFunction) => {

  const poll = resolve => {
    if(conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 10);
  };

  return new Promise(poll);
};

export const addStyleString = (style) => {
  var styleNode = document.getElementById('content-generator-style');
  if (!styleNode) {
    styleNode = document.createElement('style');
    styleNode.id = 'content-generator-style';
    document.body.append(styleNode);
  }
  styleNode.innerHTML = style;
};

export const createLoading = () => {
  const nodes = getNodes('<div id="loading-overlay"><div class="loading-spinner"></div><div class="message">Filling content...</div></div>');
  addStyleString('#loading-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999999;display:none;justify-content:center;align-items:center;background:rgba(0,0,0,.8);flex-direction:column}#loading-overlay .loading-spinner{width:15px;height:15px;border-radius:50%;border:3px dotted rgba(255,255,255,.7);-webkit-animation:load3 .8s infinite linear;animation:load3 .8s infinite linear;-webkit-transform:translateZ(0);-ms-transform:translateZ(0);transform:translateZ(0)}@-webkit-keyframes load3{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes load3{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}#loading-overlay .message{margin-top:10px;color:rgba(255,255,255,.7);font-size:13px;font-weight:700}');
  document.body.appendChild(nodes);
  return document.getElementById('loading-overlay');
};


export const toggleLoading = (show) => {
  const loadingOverlay = document.getElementById('loading-overlay');
  loadingOverlay.style.display = show ? 'flex' : 'none';
};

const getNodes = str => document.createRange().createContextualFragment(str);

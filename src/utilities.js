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

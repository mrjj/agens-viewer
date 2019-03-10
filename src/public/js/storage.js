/**
 * Global singleton to store memoryStorage data
 * @type {Object}
 */

const MEM_STORAGE_DATA_SYMBOL_NAME = 'MEM_STORAGE_DATA_SYMBOL';
const MEM_STORAGE_DATA_SYMBOL = Symbol(MEM_STORAGE_DATA_SYMBOL_NAME);
const MEM_STORAGE_DATA = window[MEM_STORAGE_DATA_SYMBOL] || {};
window[MEM_STORAGE_DATA_SYMBOL] = MEM_STORAGE_DATA;

/**
 * fallback to memStorage
 * @type {{getItem: (function(*): *), setItem: (function(*, *): *)}}
 */
const memStorage = {
  getItem: (key) => MEM_STORAGE_DATA[key],
  setItem: (key, value) => {
    MEM_STORAGE_DATA[key] = value;
    return value;
  }
};

/**
 * Check storage availability
 * @param type
 * @returns {boolean}
 */
const isStorageAvailable = (type) => {
  let storage;
  try {
    storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && (// everything except Firefox
      e.code === 22
      // Firefox
      || e.code === 1014
      // test name field too, because code might not be present
      // everything except Firefox
      || e.name === 'QuotaExceededError'
      // Firefox
      || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    ) && (
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0
    );
  }
};


/**
 * Get browser STORAGE
 * @param preferSessionStorage
 * @param enableFallback
 * @returns {Storage}
 */
const getStorage = (preferSessionStorage = false, enableFallback = true) => {
  if (preferSessionStorage) {
    if (isStorageAvailable('sessionStorage')) {
      return window.sessionStorage;
    }
    console.warn('No sessionStorage available, trying to use localStorage instead');
    if (enableFallback && isStorageAvailable('localStorage')) {
      return window.localStorage;
    }
  }
  if (isStorageAvailable('localStorage')) {
    return window.localStorage;
  }
  console.warn('No localStorage available, trying to use sessionStorage instead');
  if (enableFallback && isStorageAvailable('sessionStorage')) {
    return window.sessionStorage;
  }
  console.warn('Falling back to `memStorage`');
  return memStorage;
};

/**
 * Global storage
 *
 * @const STORAGE
 * @type {Storage}
 */
const STORAGE = getStorage();

/**
 * Get value from Storage
 * @param key {string} - key
 * @param defaultValue {?any} - returned when key not found
 * @returns {*}
 */
window.getItem = (key, defaultValue) => {
  const value = STORAGE.getItem(key);
  if ((value === null) || (typeof value === 'undefined')) {
    return defaultValue;
  }
  if (value.match(/(^\[.*]$)|(^{.*}$)/g)) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return value;
};

/**
 * Set value to Storage
 * @param key {string} - key
 * @param value
 * @returns {*}
 */
window.setItem = (key, value) => {
  const safeValue = (typeof value === 'object') ? JSON.stringify(value) : `${value}`;
  STORAGE.setItem(key || '', safeValue);
  return value;
};

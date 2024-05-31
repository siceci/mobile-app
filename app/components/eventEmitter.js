// eventEmitter.js
const events = {};

const eventEmitter = {
  on: (event, listener) => {
    if (!events[event]) {
      events[event] = [];
    }
    events[event].push(listener);
  },
  off: (event, listenerToRemove) => {
    if (!events[event]) return;

    events[event] = events[event].filter(listener => listener !== listenerToRemove);
  },
  emit: (event, data) => {
    if (!events[event]) return;

    events[event].forEach(listener => listener(data));
  },
};

export default eventEmitter;

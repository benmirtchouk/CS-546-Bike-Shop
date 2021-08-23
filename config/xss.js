const xss = require('xss');

const options = {
  whiteList: {}, 
  stripIgnoreTag: true,
}

function clean(str) {
  return xss(str, options);
}

module.exports = clean;
require('./vendor');
require('./vendor-two');

console.log('yo, dawg');

import('./async' /* webpackChunkName: "async" */).then((mod) => {
  return mod.default;
});
import Vue from 'vue';

export function keyInObj(key, obj) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

export function isEqual(x, y) {
  return JSON.stringify(x) === JSON.stringify(y);
};

export function lsplit(x, sep, maxsplit) {
  x = x.split(sep);
  const result = x.splice(0, maxsplit);

  if (x.length) {
    result.push(x.join(sep));
  }

  return result;
};

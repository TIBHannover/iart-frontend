import Vue from 'vue';
export function keyInObj(key, obj) {
  if (typeof obj !== 'object') return false;
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
export function getHash(x) {
  const md5 = require('crypto').createHash('md5');
  return md5.update(JSON.stringify(x)).digest('hex');
};
export function repPlace(x, y) {
  const string = y.replace(
    /{(\w+)}/g,
    (withDelimiters, withoutDelimiters) =>
    x.hasOwnProperty(withoutDelimiters) ?
      x[withoutDelimiters] : withDelimiters
  );
  return string;
}
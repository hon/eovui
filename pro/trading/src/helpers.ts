export function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * 合并对象
 * 来源:  https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge?
 * noredirect=1&lq=1
 */
export function mergeDeep(target: any, source: any) {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}


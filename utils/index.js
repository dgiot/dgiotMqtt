/**
 *
 * @param type ['subscribe','publish','unsubscribe']
 * @return {string}
 */
export function getMqttEventId(type) {
  return type + 'Identifier';
}

/**
 * @param topic
 * @param fullPath
 * @return {*}
 */
export function getTopicEventId(topic, fullPath) {
  const mergesKey = topic + md5(fullPath);
  return md5(mergesKey);
}

/**
 *
 * @param map
 * @return {null}
 * @constructor
 */
export function Map2Json(map) {
  let obj = Object.create(null);
  for (let [k, v] of map) {
    // console.log(k, v)
    obj[k] = v;
  }
  return obj;
}

const settingsName = 'copilot_settings';
let copilot_settings = {};

// 保存设置
export function set(key, val) {
  copilot_settings[key] = val;
  var obj = {};
  obj[settingsName] = copilot_settings;
  console.log(copilot_settings);
  chrome.storage.local.set(obj, function() {
    console.log('Settings are saved.');
  });
}

// 获取设置
export function get(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(settingsName, function(items) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(items[settingsName][key]);
    });
  });
}

let storage = {
  get,
  set,
}
export default storage;

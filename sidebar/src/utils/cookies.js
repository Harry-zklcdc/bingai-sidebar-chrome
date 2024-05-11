export function get(name) {
  const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
}

export function set(name, value, minutes = 0, path = '/', domain = '') {
  let details = {
    // domain: domain,
    name: name,
    value: value,
    path: path,
    expirationDate: minutes > 0 ? new Date().getTime() + minutes * 60 * 1000 : 0,
    url: 'https://' + domain + path,
  }
  console.log(details)
  chrome.cookies.set(details, callback)
}

function callback(cookie) {
  console.log(cookie);
}

const cookies = {
  get,
  set,
};
export default cookies;
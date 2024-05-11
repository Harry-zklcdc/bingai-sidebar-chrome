if (chrome.sidePanel) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
} else {
  chrome.action.onClicked.addListener(() => {
    chrome.notifications.create({
      type: "basic",
      title: "Unsupported",
      iconUrl: chrome.runtime.getURL("icon.png"),
      message: "Please upgrade your Chrome browser to version 114+",
    });
  });
}

const settingsName = 'copilot_settings';
var baseUrl = '', BASE_URL, cookies = {}, cookieStr = '';
chrome.storage.local.get(settingsName, function(items) {
  if (items[settingsName]) {
    baseUrl = items[settingsName].baseUrl;
    BASE_URL = new URL("https://"+BASE_URL);
    // getCookies(baseUrl);
    updateDynamicRules(baseUrl);
  }
});

// function getCookies(baseUrl) {
//   cookies = {}
//   let BASE_URL = new URL("https://"+baseUrl);
//   chrome.cookies.getAll( { domain: BASE_URL.hostname.split('.').slice(-2).join('.')}, function( cookie ){ 
//     cookie.forEach(function(c){ 
//       if (c.name === 'cf_clearance') cookies['cf_clearance'] = c.value;
//     });
//     chrome.cookies.getAll( { domain: BASE_URL.hostname}, function( cookie ){ 
//       cookie.forEach(function(c){ 
//         cookies[c.name] = c.value;
//       });
//       cookieStr = Object.keys(cookies).map(k => k + '=' + cookies[k]).join('; ');
//       updateDynamicRules(baseUrl);
//     });
//   });
// }

function updateDynamicRules(baseUrl) {
  console.log(cookieStr)
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 3],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            // {
            //   header: "cookie",
            //   operation: "set",
            //   value: cookieStr,
            // },
            {
              header: "user-agent",
              operation: "set",
              value:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
            },
            {
              header: "sec-ch-ua",
              operation: "set",
              value: '"Microsoft Edge";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
            },
          ],
          responseHeaders: [
            { header: "x-frame-options", operation: "remove" },
            { header: "content-security-policy", operation: "remove" },
          ],
        },
        condition: {
          urlFilter: `*://${baseUrl}/*`,
          isUrlFilterCaseSensitive: false,
        },
      },
      {
        id: 3,
        priority: 1,
        action: {
          type: "modifyHeaders",
          responseHeaders: [
            {
              header: "Allow-CSP-From",
              operation: "set",
              value: "https://"+baseUrl
            }
          ]
        },
        condition: {
          requestDomains: [baseUrl],
          resourceTypes: ["sub_frame"]
        }
      }
    ],
  });
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    let copilot_settings = {
      baseUrl: "az.b1ng.chat",
    }
    var obj = {};
    obj[settingsName] = copilot_settings;
    chrome.storage.local.set(obj, function() {
      console.log('Settings are saved.');
    });
    chrome.tabs.create({ url: "https://b1ng.chat" });
  }
});

chrome.storage.onChanged.addListener(function(changes, areaName){
  updateDynamicRules(changes[settingsName].newValue.baseUrl);
});

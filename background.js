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
var baseUrl = '', BASE_URL, cookies = {}, cctCookie = '';
chrome.storage.local.get(settingsName, function(items) {
  if (items[settingsName]) {
    baseUrl = items[settingsName].baseUrl;
    BASE_URL = new URL("https://"+BASE_URL);
    getCookies(baseUrl);
  }
});

function getCookies(baseUrl) {
  chrome.cookies.get( { url: "https://"+baseUrl, name: 'cct'}, function( cookie ){ 
    if (cookie) {
      cctCookie = cookie.value;
      console.log('Get cct cookie: '+cctCookie)
    }
    updateDynamicRules(baseUrl);
  });
}

function updateDynamicRules(baseUrl) {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [ 1, 2, 3 ],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
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
        id: 2,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: "cookie",
              operation: "append",
              value: 'cct='+cctCookie,
            },
          ],
        },
        condition: {
          urlFilter: `*://${baseUrl}/*`,
          isUrlFilterCaseSensitive: false,
          resourceTypes: ["websocket"],
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
          requestDomains: [ baseUrl ],
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

chrome.cookies.onChanged.addListener(function(changeInfo) {
  if (changeInfo.cookie.domain == baseUrl && changeInfo.cookie.name == 'cct' && changeInfo.cookie.value != cctCookie) {
    cctCookie = changeInfo.cookie.value;
    console.log('Update cct cookie: '+cctCookie)
    updateDynamicRules(baseUrl);
  }
});
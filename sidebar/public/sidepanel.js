const iframe = document.getElementById("underside-iframe-container");

function CookieGet (name) {
  const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
}

function UserStoreGet (name) {
  const userStoreStr = localStorage.getItem('user-store');
  if (userStoreStr) {
    const userStore = JSON.parse(userStoreStr);
    return userStore[name]
  }
  return null;
}

function randomString(e) {    
  e = e || 32;
  var t = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  a = t.length,
  n = '';
  for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

function randomLowercaseString(e) {    
  e = e || 32;
  var t = 'abcdefghijklmnopqrstuvwxyz123456789',
  a = t.length,
  n = '';
  for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

function randomCapitalString(e) {    
  e = e || 32;
  var t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  a = t.length,
  n = '';
  for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

function base58Encode(buffer) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  const BASE = BigInt(58)

  const encoder = new TextEncoder();
  const bytes = typeof buffer === 'string' ? new Uint8Array(encoder.encode(buffer)) : buffer
  if (bytes.length === 0) return ''

  let i, j
  let digits = [BigInt(0)]
  for (i = 0; i < bytes.length; i++) {
    for (j = 0; j < digits.length; j++) digits[j] *= BigInt(256)
    digits[0] += BigInt(bytes[i])

    let carry = BigInt(0)
    for (j = 0; j < digits.length; ++j) {
      digits[j] += carry

      carry = digits[j] / BASE
      digits[j] %= BASE
    }

    while (carry > 0) {
      digits.push(carry % BASE)

      carry /= BASE
    }
  }

  for (i = 0; bytes[i] === 0 && i < bytes.length - 1; i++) digits.push(BigInt(0))

  return digits.reverse().map(d => ALPHABET[Number(d)]).join('')
}

function base58Decode(s) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  const ALPHABET_MAP = {}
  for (let i = 0; i < ALPHABET.length; i++) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = BigInt(i)
  }
  const BASE = BigInt(58)

  if (s.length === 0) return ''

  let i, j
  let bytes = [BigInt(0)]
  for (i = 0; i < s.length; i++) {
    const c = s[i]
    if (!(c in ALPHABET_MAP)) throw new Error('Non-base58 character')

    for (j = 0; j < bytes.length; j++) bytes[j] *= BASE
    bytes[0] += ALPHABET_MAP[c]

    let carry = BigInt(0)
    for (j = 0; j < bytes.length; ++j) {
      bytes[j] += carry

      carry = bytes[j] >> BigInt(8)
      bytes[j] &= BigInt(0xff)
    }

    while (carry > 0) {
      bytes.push(carry & BigInt(0xff))

      carry >>= BigInt(8)
    }
  }

  for (i = 0; s[i] === '1' && i < s.length - 1; i++) bytes.push(BigInt(0))

  return bytes.reverse().map(b => String.fromCharCode(Number(b))).join('')
}

async function aesEncrypt(e, t) {
  const c = new TextEncoder();
  const mb = c.encode(e), kb = c.encode(t);
  const iv = window.crypto.getRandomValues(new Uint8Array(16));

  const ck = await window.crypto.subtle.importKey(
    "raw",
    kb,
    { name: "AES-CBC", length: 256 },
    false,
    ["encrypt"]
  );
  const ed = await window.crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv },
    ck,
    mb
  )

  const r = new Uint8Array(iv.byteLength + ed.byteLength);
  r.set(new Uint8Array(iv), 0);
  r.set(new Uint8Array(ed), iv.byteLength);
  return btoa(String.fromCharCode.apply(null, r));
}

async function aesDecrypt(e, t) {
  const c = new TextEncoder();
  const kb = Uint8Array.from(c.encode(t));
  const cb = Uint8Array.from(atob(e), c => c.charCodeAt(0));

  const iv = cb.slice(0, 16);
  const ct = cb.slice(16);

  const key = await window.crypto.subtle.importKey(
    "raw",
    kb,
    { name: "AES-CBC", length: 256 },
    false,
    ["decrypt"]
  );

  const dd = await window.crypto.subtle.decrypt(
    { name: "AES-CBC", iv: iv },
    key,
    ct
  );

  const d = new TextDecoder();
  return d.decode(dd);
}

_G = {
  SB: false,
  TIP: 'L2yDt6NHpVg74zXbiBVawp2LXBqjJe69YXaqikLo6FSPRXTBSUtR6ThZ41EAwzei6dMFnTLBw6ngU32nwwgiSsRc1yemqufobYSrv96ii7qArPE9nssRwizpWUHDtJr8vSzmbjS',
  TIPC: 'EQWVgx176AeS3PtMCwMpt8iG89A6uTZfqKzBsQKhA9PjXcoJBEEX9pgNmgx1stfRCh6Q4gdGgNX23KfMJ2ZBLtUbnCQXWMPAHVCNkNCxehuyHwD2uk1PWHzkFCqqYVowZQxxjxfEUFwXwucCz47doC51LdpGDQrh28xq1MZy1qXb1XeNuvJ2U1duHGi1Bqg3GJ8oXqZpqKvrWYm7dDPbjgkEeywZJw59CwMAQFmdy7GBFDP9KkqChGM2sKTW2p3RVdauSZe6tvU2evCDC56idpu4JRwaFstSjnuxaoTcxXJDcBv1AXPSZSH3zEUSbeJbTB59mnDx1jd4nsEcM4smZPnMt6x4dG7atwfFuHvjwCTCeEg5jsMJSL5bP1K2tE1pVFC7XBTo4KNpJy5dUkHrHLk8GRdixUPSQczHh9Ex7sHKN7LZK72ZN8MDg2j1iooeqAGSNEQL3QYJj6gsoPTXzVaCo1yehRjD3v9JP98U7Dye77YhhdiDSYDAMrCdpfpmFugMnpbc8FuWVvDuJsSrpGdYZe6Sdg8vwTezayJ9SBdBXdgSuksSGfgU',
  TP: '3RWrXBjvdDYrzej8AvyzFtfhe5H19ezqK8cJym54QWfqriuSZLzTmwWW8DeQr1ofndXGsivrkaa72rY44bnGKdhC9naiup2dJLaatRcKei8njCByoPdLrRZGL5jppAn2kJ5VvGVPgM4TfxtFGMPtmVJznCDJZ4MQj4cwJr9XchzDZT9utYsaq1iox7LCdaxHqjnAmDXwooeQmMYAZszBJrsUqX6HoTcLnMwFndad3mw1sHq8DrgwcEtPqsY89Gpnp4PcNe7R9D4x89C87F5PkDTh3LrMS7pvbkcp8GLNFedejNjgtT9z4r77jc5MgtfBzX3mXx1g87UEERFwyH5Zw1HsMJGEataYCDnYz4j9mxYr7qejZcC2svXoW6yLypGiM1csB6qNND7Wodj8beGiAhphYKYw1YckCELsnJH9F6uFJZG2xKNVdKFkXSw3f4AVJ5qKEaHgR3SCnuh2gciMU7DffzDnz3a3nrv5vnvmwqX3xJgQ1F76H9ahVZmWvbrVFro9G6mBrFJd2ZsEEZf2eS39m5jnzosuGTY3fo5pmo7eGAbhWj7DNHdXzqZB8cAjamdLUyA7ndVqqzH9g9DhceCMiX7PF8qbpBbeJpWeUGojKbH8Z37mRyHdnTx8y3K8MUk5r6ge3cBHyUQQDHjkYUvjss4ti8CHkJLK8wB7Xt4pE2LaA62v6BDkvLXq7ouThpeUkrFTgxdQAzuEH6o2ydPXW2qden332m1yJ9FiKGGGAkGdbFdzshgcdw4b21BzeHsMd9iHofnPK7Lr42zQpTFc31sjEJdFkMLobGdxbDqsNbQUVqmZKuHXnfBDWAz53Q67UdghdGcH79FaejZd3JqBzSyYeGQogryRthU5dGGMNhc3Sbp5LpnBDxfaGRco8XyU4mXhd9cgWJSE1RdU1hi1cBcrpkepeLgejeNgbg2dw6cAPBWYBD5G33WaPbBQHWMZ7gbZHn2YrkdoXEsqY1EQ7gCnJ7FyyJ8ykU9uCj9wM7vM12z1WJmho7AgkHFpMmTeH2pcnFTrSbeauQCFjc75kpC253rTjpv3Fu1k3tK47cdA2WFD2jTuu7zWWy55rSpMCyMpgtpxCxRhi8rVHPTckhD1zmLpy2Vn7eVEBswBGwZPtZDeMBVxR1vwhENKc4VZ14p8RNfR8hhetonrarNVM1cERRm93Z6h3bQEfs7sfY9urjTR35ddJoEtq4akE12Tat49oD6bwnzN6mktmNJ1VMNHZcaLdfPJpK3cVmVhRhUWTEe5KZkR5RF6YZmemWz9WoaajHdi4oFgk71rsfp2YXuZ5h2ZYS8GyssHgHq7sTYDJ1v6BHiDjFDvGVYmFYPs5wkeu2aB3n6gD7BFnBQ1MyDjkZqwn67C6gz1EgFDeqhMB7VsbPMNdNUkh9GrvHc56WrLuH2QQkesBqqNGv7bxeiQJtBiGKtpwGA81rXnGrHosNszFJMkiDWuJubZF8z8cQkAEWuXMgB7yNw9xno49fNAnVy2UaGQQYcyv4WBWiYqpSux5xbi68aQtSHZPR232TXFUnAx8CBvKhZS17i69LmH5TFXQuzWA7owpsntQrgvC4rV48au3v6JroVeQPXMb7XC8qpmv44K8AmuFFW7Pjwp5nTWJTu',
  S: '79cLbqW6MpzicDLEz8MHDyKFV9K9hDHbayZSM4mYMxdGGzAPG2288hvFUcAv59xDm4Vqo3h5akCiam2L6kvg7',
  SP: [ 21, 7, 4, 2, 14, 10, 7, 47, 46, 29, 40, 24, 0, 40, 3, 27, 42, 30, 37, 31, 23, 40, 29, 48, 51, 57, 15, 33, 58, 21, 30, 1, 17, 16, 40, 3, 35, 33 ],
  AT: 'Harry-zklcdc/go-proxy-bingai'
};

function sendEventToIframe(name, args) {
  console.debug("sendEventToIframe", name, JSON.stringify(args));
  iframe.contentWindow.postMessage({ eventName: name, eventArgs: args }, "*");
};

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};

function buildActiveTabInfo(tab) {
  return {
    serpQuery: "",
    isActive: true,
    tabId: "",
    windowId: "",
    groupId: "",
    windowType: "",
    isLoading: false,
    title: tab.title,
    url: tab.url,
    pageLanguage: "",
  };
};

let chatPageInitialized = false;

async function postMessageListner(event) {
  console.debug("onMessage", event.origin, JSON.stringify(event.data));
  const eventName = event.data.eventName;
  if (eventName === "Discover.Chat.Interact.Req") {
    sendEventToIframe("Discover.Chat.Interact.Rep", { status: true });
  } else if (eventName === "Discover.Chat.Consent.Req") {
    sendEventToIframe("Discover.Chat.Consent.Rep", { text: "Accepted" });
  } else if (eventName === "Discover.Chat.Page.GetData") {
    const tab = await getActiveTab();
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getPageData" });
    sendEventToIframe("Discover.Chat.Page", { text: response.text });
  } else if (eventName === "Discover.Ready" && !chatPageInitialized) {
    sendEventToIframe("Discover.VisibilityState", { isShow: true, timeStamp: Date.now() });
    sendEventToIframe("Discover.Tab.Click", { tabName: "chat", clientLevel: "window" });
    chatPageInitialized = true;
    const tab = await getActiveTab();
    if (tab) {
      sendEventToIframe("Discover.Client.TabStripModelChange", {
        eventType: "Activate",
        tabInfo: buildActiveTabInfo(tab),
      });
    }
  }
};

window.addEventListener("message", postMessageListner, false);

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  sendEventToIframe("Discover.Client.TabStripModelChange", {
    eventType: "Activate",
    tabInfo: buildActiveTabInfo(tab),
  });
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    sendEventToIframe("Discover.Client.TabStripModelChange", {
      eventType: "Activate",
      tabInfo: buildActiveTabInfo(tab),
    });
  }
});

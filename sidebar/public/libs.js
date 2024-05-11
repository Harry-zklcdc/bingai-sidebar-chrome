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
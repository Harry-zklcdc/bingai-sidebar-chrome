function isPDFPage() {
  if (/\.pdf$/i.test(location.href)) {
    return true;
  }
  if (document.querySelector("pdf-viewer")) {
    return true;
  }
  const embed = document.querySelector("embed");
  if (embed && embed.type === "application/pdf") {
    return true;
  }
  return false;
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.action) {
    case "getPageData":
      const text = document.body.innerText;
      if (text) {
        sendResponse({ text });
      } else if (isPDFPage()) {
        // extractPDFText(location.href).then((text) => sendResponse({ text }));
        chrome.runtime.sendMessage({ action: "getPdfText", url: location.href }, (response) => {
          // console.log("PDF text", response.text);
          sendResponse({ text: response.text });
        });
        return true;
      }
      break;
    case "insertToPage":
      const ele = document.activeElement;
      if (ele) {
        ele.value = request.text;
      }
      break;
    default:
      break;
  }
});

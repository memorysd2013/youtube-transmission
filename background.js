/**
 * 載入套件時執行, 可能是用 service worker 在背景執行
 */
console.log("background page ready 2");

chrome.runtime.onConnect.addListener(function (port) {
  console.log({ port })
  if (port.name === "popup") {
    port.onDisconnect.addListener(function () {
      console.log("popup has been closed")
      sendMessage({ rate: 1, stopLooping: true })
    });
  }
});

function sendMessage(message, callback = defaultCallback) {
  console.log({ message, callback })
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message, callback)
  });
}

function defaultCallback(data) {
  console.log('defaultCallback', data)
}

// let tab = getCurrentTab();

// console.log({ tab, chrome })

// chrome.scripting.executeScript({
//   target: { tabId: tab.id },
//   files: ['content.js']
// });

// async function getCurrentTab() {
//   console.log('getCurrentTab')
// }
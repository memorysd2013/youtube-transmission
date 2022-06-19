/**
 * 載入套件時執行, 可能是用 service worker 在背景執行
 */
chrome.runtime.onConnect.addListener(function (port) {
  // popup 開啟時監聽, popup 關閉後重置所有功能
  if (port.name === "popup") {
    port.onDisconnect.addListener(function () {
      sendMessage({ rate: 1, stopLooping: true })
    });
  }
});

function sendMessage(message, callback = defaultCallback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message, callback)
  });
}

function defaultCallback(data) {
  //
}
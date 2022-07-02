class Transmission {
  constructor(el, rate) {
    this.el = el;
    this.rate = rate;
  }

  startLoop(start, end) {
    if (timer) {
      this.stopLoop()
    }
    this.el.currentTime = start
    this.el?.play()
    timer = setInterval(() => {
      if (this.el.currentTime >= end || this.el.currentTime < start) {
        this.el.currentTime = start
      }
    }, 1000);
  }

  stopLoop() {
    clearInterval(timer);
    timer = null;
  }
}

/**
 * content.js 可以取得當前頁面 dom 不會因為 popup 而重複執行
 * 執行結果也會顯示在當前頁的 console 中
 */
// state
let timer = null;
let ytVideoEl = null;
let _t = null;

/**
 * onMessage
 */
chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
  let response = {}

  if (data.init) {
    response = init()
  }

  if (data.rate) {
    ytVideoEl.playbackRate = data.rate
  }

  // 有可能是 0 所以不能以 boolean 判斷
  if (Object(data).hasOwnProperty('loopStartAt')) {
    _t.startLoop(data.loopStartAt, data.loopEndAt)
  }

  if (data.stopLooping) {
    _t.stopLoop()
  }

  sendResponse(response)
});

/**
 * 點擊 extension 後觸發
 */
function init() {
  let response = {}

  if (!_t || !ytVideoEl) {
    // 抓到 youtube video 元素就初始化 Transmission 否則返回不支援
    ytVideoEl = document.querySelector('.html5-main-video')
    if (ytVideoEl) {
      _t = new Transmission(ytVideoEl, ytVideoEl.playbackRate)
      response = { rate: ytVideoEl.playbackRate }
    } else {
      _t = null;
      response = { notSupport: true }
    }
  } else {
    // 已經初始化過 返回現有的資訊讓插件可以同步參數
    response = { rate: ytVideoEl.playbackRate }
  }
  return response
}
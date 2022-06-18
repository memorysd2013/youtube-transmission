class Transmission {
  constructor(el, rate) {
    this.loopStart = 0;
    this.loopEnd = 0;
    this.el = el;
    this.rate = rate;
  }

  get loopTime() {
    return {
      loopStart: this.loopStart,
      loopEnd: this.loopEnd,
    }
  }

  loop(start, end) {
    this.loopStart = start;
    this.loopEnd = end;
    console.log({ start, end })
    this.el.currentTime = this.loopStart

    timer = setInterval(() => {
      console.log('current', this.el.currentTime, timer)

      if (this.el.currentTime >= this.loopEnd || this.el.currentTime < this.loopStart) {
        this.el.currentTime = this.loopStart
      }

    }, 1000);

    console.log({ timer })
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

console.log('content.js', window)

chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
  console.log({ data, ytVideoEl })
  let response = {}

  if (data.init) {
    response = init()
  }

  if (data.rate) {
    ytVideoEl.playbackRate = data.rate
  }

  if (Object(data).hasOwnProperty('loopStart')) {
    _t.loop(data.loopStart, data.loopEnd)
  }

  if (data.stopLooping) {
    _t.stopLoop()
  }

  sendResponse(response)
});

chrome.runtime.onConnect.addListener((data) => {
  console.log('content.js onConnect', { data });
});

/**
 * function
 */
/**
 * 點擊 extension 後觸發
 */
function init() {
  console.log('init')

  let response = {}

  if (!_t || !ytVideoEl) {
    ytVideoEl = document.querySelector('.html5-main-video')

    if (ytVideoEl) {
      _t = new Transmission(ytVideoEl, ytVideoEl.playbackRate)
      response = { rate: ytVideoEl.playbackRate, ..._t.loopTime }
    } else {
      _t = null;
      response = { msg: 'cannotFindEl' }
    }
  } else {
    response = { rate: ytVideoEl.playbackRate, ..._t.loopTime }
  }

  return response
}
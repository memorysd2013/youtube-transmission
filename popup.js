const RATE_MAX = 200
const RATE_MIN = 10
const TIME_MAX = 59
const TIME_MIN = 0

/**
 * @popupjs
 *   點開 popup 後才會執行，點擊網頁後等同於 blur popup 會銷毀
 *   待下次開啟後重新執行一次
 */

const EL_SPEED = document.getElementById('ytt-speed')
const EL_SLIDER = document.getElementById('ytt-slider')
const EL_PLUS = document.getElementById('ytt-plus')
const EL_MINUS = document.getElementById('ytt-minus')
const EL_RESET = document.getElementById('ytt-reset')
const EL_LOOP_BTN = document.getElementById('ytt-loop')
const EL_STOP_BTN = document.getElementById('ytt-stop')
const EL_LOOP_START_M = document.getElementById('ytt-loop-start-m')
const EL_LOOP_START_S = document.getElementById('ytt-loop-start-s')
const EL_LOOP_END_M = document.getElementById('ytt-loop-end-m')
const EL_LOOP_END_S = document.getElementById('ytt-loop-end-s')
const EL_PROMPT = document.getElementById('ytt-loop-prompt')
const EL_LOOP_ICON = document.getElementById('ytt-looping')

// unit: %
let speed = 100

EL_SLIDER.addEventListener('change', () => updateSpeed(Number(EL_SLIDER.value)))
EL_PLUS.addEventListener('click', () => updateSpeed(speed + 1))
EL_MINUS.addEventListener('click', () => updateSpeed(speed - 1))
EL_RESET.addEventListener('click', () => updateSpeed(100))
EL_LOOP_BTN.addEventListener('click', () => startLoop())
EL_STOP_BTN.addEventListener('click', () => stopLoop())

[EL_LOOP_START_M, EL_LOOP_START_S, EL_LOOP_END_M, EL_LOOP_END_S].forEach(el => {
  el.addEventListener('change', rangeFormatter.bind(null, el))
  el.addEventListener('focus', () => el.select())
})

chrome.runtime.connect({ name: "popup" });

sendMessage(
  { init: true },
  function (res) {
    if (res.notSupport) {
      setNotSupport()
    }
    if (res.rate) {
      setSpeed(res.rate * 100)
    }
  }
)

/**
 * 設置速率
 * @param val [Number]
 */
function setSpeed(val) {
  speed = val
  EL_SPEED.innerText = val
  if (EL_SLIDER.value !== val) {
    EL_SLIDER.value = val
  }
}

/**
 * 與 content.js 溝通
 */
function sendMessage(message, callback = defaultCallback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message, callback)
  });
}

/**
 * sendMessage 後的回饋
 */
function defaultCallback(data) {
  //
}

/**
 * 設置速率
 * @param val [Number]
 */
function updateSpeed(val) {
  if (val <= RATE_MAX && val >= RATE_MIN) {
    setSpeed(val)
    sendMessage({ rate: val / 100 })
  }
}

/**
 * 設置 loop
 * - 判斷迴圈時間是否合理（結束時間不可小於開始時間）
 */
function startLoop() {
  const loopStartAt = Number(EL_LOOP_START_M.value) * 60 + Number(EL_LOOP_START_S.value)
  const loopEndAt = Number(EL_LOOP_END_M.value) * 60 + Number(EL_LOOP_END_S.value)
  if (loopStartAt < loopEndAt) {
    EL_PROMPT.textContent = ''
  } else {
    EL_PROMPT.textContent = 'loop time is invalid!'
    return
  }
  sendMessage({ loopStartAt, loopEndAt })
  setLoopState(true)
}

/**
 * 停止 loop
 * - 時間設置歸 0
 * - 觸發清空 content 的 timer
 */
function stopLoop() {
  setTimeToEl(0, EL_LOOP_START_M, EL_LOOP_START_S)
  setTimeToEl(0, EL_LOOP_END_M, EL_LOOP_END_S)
  sendMessage({ stopLooping: true })
  setLoopState(false)
}

function setLoopState(isLoop) {
  EL_LOOP_ICON.style.display = isLoop ? 'inline-block' : 'none'
}

function rangeFormatter(el) {
  if (el.value > TIME_MAX) {
    el.value = TIME_MAX;
  } else if (el.value < TIME_MIN) {
    el.value = TIME_MIN;
  }
  // 補 0 或去除 0
  el.value = Number(el.value) < 10 ? `0${Number(el.value)}` : Number(el.value)
}

function setTimeToEl(val, elMin, elSec) {
  let m = Math.floor(val / 60)
  let s = val % 60
  elMin.value = m < 10 ? `0${m}` : m
  elSec.value = s < 10 ? `0${s}` : s
}

function setNotSupport() {
  // 
}
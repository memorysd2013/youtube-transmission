const RATE_MAX = 200
const RATE_MIN = 10
const TIME_MAX = 59
const TIME_MIN = 0

// 點開 popup 後才會執行
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
let isLoop = false

EL_SLIDER.addEventListener('change', () => updateSpeed(Number(EL_SLIDER.value)))
EL_PLUS.addEventListener('click', () => updateSpeed(speed + 1))
EL_MINUS.addEventListener('click', () => updateSpeed(speed - 1))
EL_RESET.addEventListener('click', () => updateSpeed(100))
EL_LOOP_BTN.addEventListener('click', () => toggleLoop())
EL_STOP_BTN.addEventListener('click', () => {
  setTimeToEl(0, EL_LOOP_START_M, EL_LOOP_START_S)
  setTimeToEl(0, EL_LOOP_END_M, EL_LOOP_END_S)
  sendMessage({ stopLooping: true })
  setLoopState(false)
})

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

function sendMessage(message, callback = defaultCallback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message, callback)
  });
}

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

function toggleLoop(val) {
  const loopStart = Number(EL_LOOP_START_M.value) * 60 + Number(EL_LOOP_START_S.value)
  const loopEnd = Number(EL_LOOP_END_M.value) * 60 + Number(EL_LOOP_END_S.value)
  if (loopStart < loopEnd) {
    EL_PROMPT.textContent = ''
  } else {
    EL_PROMPT.textContent = 'loop time is invalid!'
    return
  }
  sendMessage({ loopStart, loopEnd })
  setLoopState(true)
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
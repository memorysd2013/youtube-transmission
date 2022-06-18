const RATE_MAX = 200
const RATE_MIN = 10
const TIME_MAX = 59
const TIME_MIN = 0

// 點開 popup 後才會執行
console.log('pop.js excute')

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

// unit: %
let speed = 100
let isLoop = false

EL_SLIDER.addEventListener('change', () => updateSpeed(Number(EL_SLIDER.value)))
EL_PLUS.addEventListener('click', () => updateSpeed(speed + 1))
EL_MINUS.addEventListener('click', () => updateSpeed(speed - 1))
EL_RESET.addEventListener('click', () => updateSpeed(100))
EL_LOOP_BTN.addEventListener('click', () => toggleLoop(true))
EL_STOP_BTN.addEventListener('click', () => toggleLoop(false))

sendMessage(
  { init: true },
  function (res) {
    setSpeed(res.rate * 100)
    setTimeToEl(res.loopStart, EL_LOOP_START_M, EL_LOOP_START_S)
    setTimeToEl(res.loopEnd, EL_LOOP_END_M, EL_LOOP_END_S)
  }
)

/**
 * 設置速率
 * val must has be Number
 */
function setSpeed(val) {
  speed = val
  EL_SPEED.innerText = val
  if (EL_SLIDER.value !== val) {
    EL_SLIDER.value = val
  }
}

async function updateRate(rate) {
  // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  sendMessage({ rate })
}

function sendMessage(message, callback = defaultCallback) {
  console.log({ message, callback })
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message, callback)
  });
}

function defaultCallback(data) {
  console.log('defaultCallback', data)
}

function updateSpeed(val) {
  console.log('updateSpeed')
  if (val <= RATE_MAX && val >= RATE_MIN) {
    setSpeed(val)
    updateRate(val / 100)
  }
}

function toggleLoop(val) {
  console.log(EL_LOOP_START_M.value)
  console.log(EL_LOOP_START_S.value)
  console.log(EL_LOOP_END_M.value)
  console.log(EL_LOOP_END_S.value)

  const start = Number(EL_LOOP_START_M.value) * 60 + Number(EL_LOOP_START_S.value)
  const end = Number(EL_LOOP_END_M.value) * 60 + Number(EL_LOOP_END_S.value)

  if (start < end) {
    EL_PROMPT.textContent = ''
  } else {
    EL_PROMPT.textContent = 'loop time is invalid!'
    return
  }

  if (val) {
    sendMessage({ loopStart: start, loopEnd: end })
  } else {
    sendMessage({ stopLooping: true })
  }

  EL_LOOP_BTN.style.display = !val ? 'block' : 'none'
  EL_STOP_BTN.style.display = val ? 'block' : 'none'
}

/**
 * Listener
 */
[EL_LOOP_START_M, EL_LOOP_START_S, EL_LOOP_END_M, EL_LOOP_END_S].forEach(el => {
  el.addEventListener('change', rangeFormatter.bind(null, el))
  el.addEventListener('focus', () => el.select())
})

function rangeFormatter(el) {
  if (el.value > TIME_MAX) {
    el.value = TIME_MAX;
  } else if (el.value < TIME_MIN) {
    el.value = TIME_MIN;
  }
  // 補 0 或去除 0
  el.value = Number(el.value) < 10 ? `0${Number(el.value)}` : Number(el.value)
};

function setTimeToEl(val, elMin, elSec) {
  let m = Math.floor(val / 60)
  let s = val % 60
  elMin.value = m < 10 ? `0${m}` : m
  elSec.value = s < 10 ? `0${s}` : s
};
let config = {
  mainColor: '',
  mainFont: '',
  pomodoro: 25,
  shortBreak: 1,
  longBreak: 15,
  activeTimer: 'pomodoro'
};

function ready() {
  if (localStorage.getItem('config')) {
    config = JSON.parse(localStorage.getItem('config'));
  }
  switchTimer('pomodoro');
  applySettings();
}

document.addEventListener("DOMContentLoaded", ready);

window.onbeforeunload = function () {
  localStorage.setItem('config', JSON.stringify(config));
};

let timerId;
let indicatorId;

const tabsItem = document.querySelectorAll('.tabs__item');
const fontsSelect = document.querySelectorAll('.block-settings--font .block-body__item');
const colorsSelect = document.querySelectorAll('.block-settings--color .block-body__item');

const timer = document.querySelector('.timer__time');
const actionRestart = document.querySelector('.timer__action--restart');
const actionPause = document.querySelector('.timer__action--pause');

const counterUp = document.querySelectorAll('.block-item__counter-up');
const counterDown = document.querySelectorAll('.block-item__counter-down');

const applyBtn = document.querySelector('.settings__submit');

const sound = document.querySelector('#sound');

const setActive = element => {
  switch (element.innerText) {
    case 'pomodoro':
      switchTimer('pomodoro');
      break;
    case 'short break':
      switchTimer('shortBreak');
      break;
    case 'long break':
      switchTimer('longBreak');
      break;
    default:
      break;
  }

  element.classList.add('active');
};

const removeActive = elements => {
  elements.forEach(el => {
    el.classList.remove('active');
  })
};

const setActiveOnClick = elements => {
  elements.forEach(element => {
    element.addEventListener('click', () => {
      removeActive(elements);
      setActive(element);
    });
  });
};

setActiveOnClick(tabsItem);
setActiveOnClick(fontsSelect);
setActiveOnClick(colorsSelect);

// INDICATOR WORK //

const circle = document.querySelector('.timer-progress__circle');
const radius = circle.r.baseVal.value;
const circumference = 2 * radius * Math.PI;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

const setProgress = percent => {
  const offset = circumference - percent / 100 * circumference;
  circle.style.strokeDashoffset = offset;
}

// TIMER WORK //

const switchTimer = (timerStr) => {
  config.activeTimer = timerStr;
  timer.innerText = config[config.activeTimer] + ':00';
  clearInterval(timerId);

  actionPause.classList.remove('active');
  actionRestart.classList.add('active');
  setProgress(100);
}

actionRestart.addEventListener('click', (e) => {
  e.target.classList.remove('active');
  actionPause.classList.add('active');

  timerId = startTimer(document.querySelector('.timer__time').innerText)
});

actionPause.addEventListener('click', (e) => {
  e.target.classList.remove('active');
  actionRestart.classList.add('active');

  clearInterval(timerId);
});

const startTimer = (timeStr) => {
  const totalTime = config[config.activeTimer] * 60;
  let time = +timeStr.slice(0, -3) * 60 + +timeStr.slice(-2) - 1;

  const updateTimer = function () {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    setProgress(time / totalTime * 100);

    seconds = seconds < 10 ? '0' + seconds : seconds;
    timer.innerText = `${minutes}:${seconds} `;

    if (time === 0) {
      sound.play();
      clearInterval(timerId);
      actionPause.classList.remove('active');
      actionRestart.classList.add('active');
    } else {
      time--;
    }
  }

  return timerId = setInterval(updateTimer, 1000);
};

// APPLY SETTINGS //

const applySettings = () => {
  const color = window.getComputedStyle(document.documentElement).getPropertyValue(`--${config.mainColor}`);

  document.documentElement.style.setProperty('--main-color', color);
  document.documentElement.style.setProperty('--main-font-family', config.mainFont);

  timer.innerText = config[config.activeTimer] + ':00';
};

counterUp.forEach(up => {
  up.addEventListener('click', e => {
    e.stopPropagation();
    e.target.parentElement.firstElementChild.innerHTML = +e.target.parentElement.innerText + 1;
  });
});

counterDown.forEach(up => {
  up.addEventListener('click', e => {
    e.stopPropagation();
    let target = e.target.parentElement.firstElementChild.innerHTML;
    if (+target !== 0) {
      e.target.parentElement.firstElementChild.innerHTML = +e.target.parentElement.innerText - 1;
    }
  });
});

applyBtn.addEventListener('click', e => {
  e.preventDefault();

  const [pomodoro, short, long] = Array.prototype.slice.call(document.querySelectorAll('.block-item__counter span'));
  config.pomodoro = pomodoro.innerText;
  config.shortBreak = short.innerText;
  config.longBreak = long.innerText;

  const [font, color] = document.querySelectorAll('.block-body__item.active');
  config.mainFont = font.getAttribute('data-font');
  config.mainColor = color.getAttribute('data-color');

  applySettings();

  popupClose(document.querySelector('.popup.show'));
});

// OPEN POPUP //

const popupLinks = document.querySelectorAll('.popup-link');
const body = document.querySelector('body');
const timeout = 500;

if (popupLinks.length > 0) {
  for (let index = 0; index < popupLinks.length; index++) {
    const popupLink = popupLinks[index];
    popupLink.addEventListener("click", function (e) {
      const popupName = popupLink.getAttribute('href').replace('#', '');
      const curentPopup = document.getElementById(popupName);
      popupOpen(curentPopup);
      e.preventDefault();
    });
  }
};

const popupCloseIcon = document.querySelectorAll('.close-popup');
if (popupCloseIcon.length > 0) {
  for (let index = 0; index < popupCloseIcon.length; index++) {
    const el = popupCloseIcon[index];
    el.addEventListener('click', function (e) {
      popupClose(el.closest('.popup'));
      e.preventDefault();
    });
  }
}

function popupOpen(curentPopup) {
  if (curentPopup) {
    const popupActive = document.querySelector('.popup.show');
    if (popupActive) {
      popupClose(popupActive);
    }
    curentPopup.classList.add('show');
    curentPopup.addEventListener("click", function (e) {
      if (!e.target.closest('.popup__content')) {
        popupClose(e.target.closest('.popup'));
      }
    });
  }
}

function popupClose(popupActive) {
  popupActive.classList.remove('show');
}

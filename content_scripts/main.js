const CODE_DOM_SELECTORS = [
  "pre" // general
]
const IGNORE_URLS = [
  "www.google.com" // google translation
]

const XOFFSET = 72;
const YOFFSET = 4;
const ICON_PATH = chrome.extension.getURL('assets/copy.png');
const INIT_CLASS = "copy-button";
const INIT_STR = "copy";
const CLICKED_CLASS = "copy-button clicked";
const CLICKED_STR = "copied";

const revertButton = (elm) => {
  elm.textContent = INIT_STR;
  elm.className = INIT_CLASS;
}

const clickCopyButton = () => {
  const targetSelector = event.target.dataset.target;

  const tmp = document.createElement("textarea");
  tmp.display = 'none';
  const snippetElm = document.querySelector(targetSelector);
  if (snippetElm) {
    tmp.value = snippetElm.textContent;

    document.body.appendChild(tmp);
    tmp.select();
    const result = document.execCommand("copy");
    document.body.removeChild(tmp);

    if (!result) {
      console.log("[ERROR] can not copy code");
    } else {
      event.target.textContent = CLICKED_STR;
      event.target.className = CLICKED_CLASS;
      setTimeout(revertButton.bind(undefined, event.target), 2500);
    }
  }
}

const getPosition = (elm) => {
  const rect = elm.getBoundingClientRect();

  let x = rect.width, y = 0;
  while (elm) {
    x += elm.offsetLeft || 0;
    y += elm.offsetTop || 0;
    elm = elm.offsetParent;
  }

  return [x, y];
}

const getIndex = (elm) => {
  const name = elm.nodeName.toLowerCase();

  let index = 1;
  while((elm = elm.previousElementSibling)) {
    if(elm.nodeName.toLowerCase() === name) {
      index++;
    }
  }

  return index;
}

const getSelector = (elm) => {
  const selector = [];
  if(!(elm instanceof Element)) {
    return '';
  }

  while(elm.nodeType === Node.ELEMENT_NODE) {
    let path = elm.nodeName.toLowerCase();
    if(elm.id) {
      path += '#' + elm.id;
      selector.unshift(path);
      break;
    }

    const index = getIndex(elm);
    if(1 < index) {
      path += `:nth-of-type(${index})`;
    }

    selector.unshift(path);
    elm = elm.parentNode;
  }

  return selector.join(' > ');
}

const makeCopyButton = (targetElm) => {
  let copyButton = document.createElement('div');
  const targetSelector = getSelector(targetElm);
  const [x, y] = getPosition(targetElm);

  copyButton.textContent = INIT_STR;
  copyButton.className = INIT_CLASS;
  copyButton.dataset.target = targetSelector;
  copyButton.onclick = clickCopyButton;
  copyButton.style.top = `${y + YOFFSET}px`;
  copyButton.style.left = `${x - XOFFSET}px`;
  copyButton.style.zIndex = targetElm.style.zIndex + 1;

  return copyButton;
}


const onPageLoad = () => {
  const body = document.body;
  for (const selector of CODE_DOM_SELECTORS) {
    const elms = document.querySelectorAll(selector);
    for (elm of elms) {
      body.insertBefore(makeCopyButton(elm), body.firstChild);
    }
  }
};


let enable = true;
const url = location.href;
for (const ignore_url of IGNORE_URLS) {
    if (url.indexOf(ignore_url) !== -1) {
        enable = false;
        break;
    }
}

if (enable) {
  onPageLoad();
}

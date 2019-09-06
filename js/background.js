function load() {
  window.console.info('background.js load！');
  if(window.$){
    init();
  }
}
window.onload = load();

// 初始化
function init() {
  let tab = get("tab");
  let images = get("images");
  for(let i=0; i<images.length; i++){
    $(".container").append("<img alt='" + images[i].fileName + "'src='" + images[i].url + "'>");
  }
}

// 修改图标信息
function changeBadge(content) {
  chrome.browserAction.setBadgeText({text: content});
  chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
}

// 保存数据到localStorage
function save(key, value) {
  localStorage[key] = JSON.stringify(value);
}

// 从localStorage获取数据
function get(key) {
  return JSON.parse(localStorage[key]);
}
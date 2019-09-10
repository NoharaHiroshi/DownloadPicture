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
  let container = $(".container");
  $(".width-range-slider").ionRangeSlider({
    type: "double",
    grid: true,
    min: 0,
    max: 2000,
    from: 500,
    to: 1000,
    postfix: "px",
    onChange: function (data) {//数据变化时触发
      console.log(data);
    },
  });
  $(".height-range-slider").ionRangeSlider({
    type: "double",
    grid: true,
    min: 0,
    max: 2000,
    from: 500,
    to: 1000,
    postfix: "px",
    onChange: function (data) {//数据变化时触发
      console.log(data);
    },
  });
  for(let i=0; i<images.length; i++){
      getImageSize(images[i].url, (w, h)=>{
        console.log(w, h);
        container.append("<div class='item'>" +
          "<img alt='" + images[i].fileName + "'src='" + images[i].url + "'>" +
          "<div class='img-size'>" + w + " X " + h +"</div>" +
          "</div>");
      });
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

// 获取图片大小
function getImageSize(url, callback) {
  let img = new Image();
  img.src = url;
  // 如果图片被缓存，则直接返回缓存数据
  if (img.complete) {
    callback(img.width, img.height);
  } else {
    img.onload = function () {
      callback(img.width, img.height);
    }
  }
}
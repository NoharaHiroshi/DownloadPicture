let fromW = 0,
  toW = 0,
  fromH = 0,
  toH = 0;
let downloadCount = 0;
let allDownloadCount = 0;

function load() {
  window.console.info('background.js load！');
  if(window.$){
    init();
    // 下载选中图片
    let tab = get("tab");
    $("#downloadSelected").click(function (e) {
      let images = $(".multi-selected > img");
      downloadImages(images, tab.title);
    });
    // 全选
    $("#selectAll").click(function (e) {
      let items = document.querySelectorAll('.item');
      items.forEach(function (o) {
        $(o).addClass("multi-selected");
      })
    });
    // 反选
    $("#selectOther").click(function (e) {
      let items = document.querySelectorAll('.item');
      items.forEach(function (o) {
        if($(o).hasClass('multi-selected')){
          $(o).removeClass("multi-selected");
        }else{
          $(o).addClass("multi-selected");
        }
      })
    })
  }
}
window.onload = load();

// 初始化
function init() {
  let tab = get("tab");
  let images = get("images");
  console.log(tab);
  $("#title").text(tab.title);
  $("#url").text(tab.url);
  $("#imgCount").text(images.length);
  let container = $(".container");
  let maxWidth = 0;
  let maxHeight = 0;
  let successCount = 0;
  for(let i=0; i<images.length; i++){
      getImageSize(images[i].url, (w, h)=>{
        if (w > maxWidth) { maxWidth = w; }
        if (h > maxHeight) { maxHeight = h; }
        container.append("<div class='item'>" +
          "<img alt='" + images[i].fileName + "'src='" + images[i].url + "'>" +
          "<div class='img-size'>" + w + " X " + h +"</div>" +
          "</div>");
        successCount ++;
        console.log("i: ", i, "successCount: ", successCount, w, h);
        fromW = 0;
        fromH = 0;
        toW = maxWidth;
        toH = maxHeight;
      });
  }
  // 循环等待所有图片加载完毕
  let times = 0;
  let timer = setInterval(function () {
    times ++;
    console.log("wait: ", successCount, "times: ", times);
    // 部分图片加载失败，不影响整体的渲染
    if(successCount === images.length || times === 5){
      console.log("initRangeSelect");
      initRangeSelect(maxWidth, maxHeight);
      clearInterval(timer);
      loading(false);
    }
  }, 1000)
}

function updateImage(fromW, toW, fromH, toH) {
  let container = $(".container");
  container.html("");
  let images = get("images");
  for(let i=0; i<images.length; i++){
    getImageSize(images[i].url, (w, h)=>{
      if((fromW <= w && w <= toW) && (fromH <= h && h <= toH)){
        container.append("<div class='item'>" +
          "<img alt='" + images[i].fileName + "'src='" + images[i].url + "'>" +
          "<div class='img-size'>" + w + " X " + h +"</div>" +
          "</div>");
      }
    });
  }
}

function initRangeSelect(maxWidth, maxHeight) {
  $(".width-range-slider").ionRangeSlider({
    type: "double",
    grid: true,
    min: 0,
    max: maxWidth,
    from: 0,
    to: maxWidth,
    postfix: "px",
    onChange: function (data) { //数据变化时触发
      fromW = data.fromNumber;
      toW = data.toNumber;
      updateImage(fromW, toW, fromH, toH);
    },
  });
  $(".height-range-slider").ionRangeSlider({
    type: "double",
    grid: true,
    min: 0,
    max: maxHeight,
    from: 500,
    to: maxHeight,
    postfix: "px",
    onChange: function (data) {//数据变化时触发
      fromH = data.fromNumber;
      toH = data.toNumber;
      updateImage(fromW, toW, fromH, toH);
    },
  });
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

// 遮罩层
function loading(bool) {
  let l = $(".loading");
  bool? l.css("display", "block"): l.css("display", "none");
}

// 下载文件状态
function downloadImagesStatus(allCount, curCount) {
    $("#allCount").text(allCount);
    $("#curCount").text(curCount);
}

// 下载文件
function downloadImages(imgObjs, filePath) {
  allDownloadCount = imgObjs.length;
  downloadCount = 0;
  for(let i=0; i<imgObjs.length; i++){
    let obj = {
      "url": imgObjs[i].src,
      "filename": filePath + '/' + imgObjs[i].alt
    };
    console.log(obj);
    chrome.downloads.download(obj, (downlaodId) => {
      if(downlaodId){
        downloadCount++;
        console.log("allDownloadCount: ", allDownloadCount, "currentDownLoadCount: ", downloadCount);
        downloadImagesStatus(allDownloadCount, downloadCount);
      }
    })
  }
}
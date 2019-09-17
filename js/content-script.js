function load() {
  window.console.info('content-script load！');
}
window.onload = load();

// 事件监听
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
  console.log(request, sender, sendResponse);
  if(request.event){
    if(request.event === "getImages") {
      let images = getImages();
      let result = {
        "req": request,
        "sender": sender,
        "result": images
      };
      sendResponse(result);
    }else if(request.event === "puzzleImages"){
      puzzleImages();
      let result = {
        "req": request,
        "sender": sender,
        "result": "success"
      };
      sendResponse(result);
    }
  }else{
    sendResponse("no registered event");
  }
});

// 获取当前页面图片信息
function getImages() {
  let imagesInfo = [];
  let images = $('img');
  if(images && images.length){
    let i,
      img,
      src,
      fileName,
      fileType;
    for(i=0; i<images.length; i++){
      img = images[i];
      src = img.src;
      fileName = src.split("/").pop().split("?")[0];
      fileType = fileName.split(".").pop().split("?")[0];
      let imageItem = {
        url: src,
        fileName: fileName,
        fileType: fileType,
        cls: $(img).attr("class")
      };
      fetch(src).then(resp => resp.blob()).then(blob => {
        let size = blob.size;
        size = (size / 1024).toFixed(2) + ' kb';
        imageItem.fielSize = size;
      });
      imagesInfo.push(imageItem);
    }
    // 去重
    imagesInfo = unique(imagesInfo, "url");
    console.log("images: ", imagesInfo);
    return imagesInfo;
    // let sendImagesInfo = getEventObj("sendImages", imagesInfo);
    // sendMessage(sendImagesInfo);
    // let changeBadgeInfo = getEventObj("changeBadge", imagesInfo.length.toString());
    // sendMessage(changeBadgeInfo);
  }else{
    console.log("未查询到当前页面图片");
    return null
  }
}

//  分析当前图片链接
function analysisImageUrl() {
  let imageSource = [];
  let images = getImages();
  if(images && images.length){
    let i,
      img,
      src,
      fileName,
      fileType;
    for(i=0; i<images.length; i++){
      console.log("anaImage： ", images[i]);
      console.log("anaImageClass： ", images[i].cls);
    }
  }
}

// 数组去重
function unique(arr, type) {
  const res = new Map();
  return arr.filter((a) => !res.has(a[type]) && res.set(a[type], 1));
}

// 向扩展发送信息
function sendMessage(info) {
  chrome.runtime.sendMessage(info, function (response) {
    console.log(response);
  });
}

// 智能拼接当前页面图片
function puzzleImages() {
  let main = $("#puzzleImages");
  console.log("main length", main.length);
  if(main.length === 0){
    $('body').append('<div class="puzzle-images" id="puzzleImages"><div class="content" id="puzzleContent"></div></div>');
    $("#puzzleImages").css({
      "top": "0",
      "margin": "0 auto",
      "position": "fixed",
      "width": "100%",
      "height": "100%",
      "background": "rgba(0,0,0,0.3)",
      "z-index": "9999",
      "padding": "20px"
    });
    $("#puzzleContent").css({
      "width": "80%",
      "height": "100%",
      "background": "#fff",
      "margin": "0 auto",
      "box-shadow": "6px 11px 41px -28px #a99de7",
      "border-radius": "5px"
    });
    analysisImageUrl();
  }
}
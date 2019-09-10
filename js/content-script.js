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
        fileType: fileType
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
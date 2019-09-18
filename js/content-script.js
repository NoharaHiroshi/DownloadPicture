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
      getImageSize(src, (w, h)=>{
        let imageItem = {
          url: src,
          fileName: fileName,
          fileType: fileType,
          cls: $(img).attr("class"),
          width: w,
          height: h
        };
        imagesInfo.push(imageItem);
      });
    }
    // 去重
    imagesInfo = unique(imagesInfo, "url");
    console.log("images: ", imagesInfo);
    return imagesInfo;
  }else{
    console.log("未查询到当前页面图片");
    return null
  }
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

//  分析当前图片链接
function analysisImageUrl() {
  let imageSource = {};
  let images = getImages();
  if(images && images.length){
    let i,
      img;
    for(i=0; i<images.length; i++){
      img = images[i];
      if(!imageSource.hasOwnProperty(img.cls)){
        imageSource[img.cls] = [img];
      }else{
        imageSource[img.cls].push(img);
      }
    }
    console.log(imageSource);
    return imageSource;
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
    $('body').append('<div class="puzzle-images" id="puzzleImages">' +
      '<div class="puzzle-content" id="puzzleContent">' +
      '<div class="close-img" id="closeImg">x</div>' +
      '</div>' +
      '</div>');
    let content = $("#puzzleContent");
    regImgSrc((renderImages) => {
      console.log("callback renderImages: ", renderImages);
      for(let i in renderImages){
        console.log("i: ", i);
        console.log(renderImages[i]);
        let w = 800;
        let h = (parseInt(renderImages[i].height) / (parseInt(renderImages[i].width) / w));
        content.append("<img class='puzzle-img' style='width:"+w+"px;height:"+h+"px;'" +
          "data-src='" + renderImages[i].url +"'>");
      }
      let domHeight = content.innerHeight();
      let renderImg = $(".puzzle-img");
      lazyLoad(renderImg, domHeight);
      content.scroll(() => {
        let scrollTop = content.scrollTop();
        for(let i=0; i < renderImg.length; i++){
          if(renderImg[i].offsetTop < scrollTop + domHeight ){
            renderImg[i].src = renderImg[i].getAttribute('data-src');
          }
        }
      });
      $("#closeImg").click(function(){
        $("#puzzleImages").remove();
      });
    });
  }
}

// 懒加载图片
function lazyLoad(renderImg, domHeight) {
  let content = $("#puzzleContent");
  let scrollTop = content.scrollTop();
  for(let i=0; i < renderImg.length; i++){
    if(renderImg[i].offsetTop < scrollTop + domHeight ){
      renderImg[i].src = renderImg[i].getAttribute('data-src');
    }
  }
}

// 推算图片地址
function regImgSrc(callback) {
  // <select>类型的翻页
  let selectValue;
  // 正则替换后的图片地址列表
  let regImageList = [];
  let $select = $("option");
  let images = getImages();
  console.log($select);
  if($select.length){
    for(let i=0; i<$select.length; i++){
      let selected = $select[i];
      if(selected.selected){
        selectValue = selected.value;
        console.log(selectValue);
        break;
      }
    }
    let imgReg = new RegExp(selectValue);
    for(let image of images){
      if(imgReg.test(image.url)){
        console.log(image);
        for(let i=0; i<$select.length; i++){
          let selected = $select[i];
          let newImgUrl = image.url.replace(imgReg, selected.value);
          regImageList.push(newImgUrl);
        }
        break;
      }
    }
    console.log("regImageList: ", regImageList);
    let imagesInfo = {};
    for(let i=0; i<regImageList.length; i++){
      let src = regImageList[i];
      let fileName = src.split("/").pop().split("?")[0];
      let fileType = fileName.split(".").pop().split("?")[0];
      getImageSize(src, (w, h)=>{
        imagesInfo[i] = {
          url: src,
          fileName: fileName,
          fileType: fileType,
          width: w,
          height: h
        };
      });
    }
    console.log("imagesInfo: ", imagesInfo);
    setTimeout(() => {
      console.log("imagesInfo.length: ", Object.keys(imagesInfo).length);
      console.log("regImageList.length: ", regImageList.length);
      if(Object.keys(imagesInfo).length === regImageList.length){
        callback(imagesInfo);
      }
    }, 500);
  }
}
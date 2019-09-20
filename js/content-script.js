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
    for(let i=0; i<images.length; i++){
      let img = images[i];
      let src = img.src;
      let fileName = src.split("/").pop().split("?")[0];
      let fileType = fileName.split(".").pop().split("?")[0];
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
  if(main.length === 0){
    $('body').append('<div class="puzzle-images" id="puzzleImages">' +
      '<div class="puzzle-content" id="puzzleContent">' +
      '<div class="close-img" id="closeImg">x</div>' +
      '</div>' +
      '</div>');
    let content = $("#puzzleContent");
    $("#closeImg").click(function(){
      $("#puzzleImages").remove();
    });
    let renderImages = calcImgSrcBySelect().length ? calcImgSrcBySelect(): getImages();
    if(renderImages.length){
      let domHeight = content.innerHeight();
      console.log("callback renderImages: ", renderImages);
      let w = 800;
      let h = 1000;
      for(let i in renderImages){
        content.append("<img class='puzzle-img' width='" + w +"' height='" + h + "' " +
          "data-src='" + renderImages[i].url +"'>");
      }
      let renderImg = $(".puzzle-img");
      content.scroll(() => {
        let scrollTop = content.scrollTop();
        for(let i=0; i < renderImg.length; i++){
          if(renderImg[i].offsetTop < scrollTop + domHeight ){
            renderImg[i].src = renderImg[i].getAttribute('data-src');
            getImageSize(renderImg[i].src, (_w, _h)=>{
              renderImg[i].height = _h / (_w / w);
            });
          }
        }
      });
      content.scrollTop(1);
    }
  }
}

// 推算图片地址(select翻页)
function calcImgSrcBySelect() {
  // 正则替换后的图片地址列表
  let regImageList = [];
  let selected = $("option:selected");
  let $select = $("option");
  let images = getImages();
  if(selected.length){
    let selectValue = selected[0].value;
    let imgReg = new RegExp(selectValue);
    for(let image of images){
      if(imgReg.test(image.url)){
        for(let i=0; i<$select.length; i++){
          let selected = $select[i];
          let src= image.url.replace(imgReg, selected.value);
          let fileName = src.split("/").pop().split("?")[0];
          let fileType = fileName.split(".").pop().split("?")[0];
          let imgItem = {
            url: src,
            fileName: fileName,
            fileType: fileType,
          };
          regImageList.push(imgItem);
        }
        break;
      }
    }
  }
  return regImageList;
}
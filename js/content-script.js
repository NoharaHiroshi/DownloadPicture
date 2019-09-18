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
        fetch(src).then(resp => resp.blob()).then(blob => {
          let size = blob.size;
          size = (size / 1024).toFixed(2) + ' kb';
          imageItem.fielSize = size;
        });
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
    $('body').append('<div class="puzzle-images" id="puzzleImages"><div class="content" id="puzzleContent"><div id="closeImg">x</div></div></div>');
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
      "border-radius": "5px",
      "text-align": "center",
      "overflow": "auto",
      "padding": "20px 0",
      "box-sizing": "border-box",
      "position": "relative",
    });
    $("#closeImg").css({
      "position": "absolute",
      "background": "#ff5566",
      "width": "25px",
      "height": "25px",
      "cursor": "pointer",
      "border-radius": "2px",
      "right": "20px",
      "color": "#fff",
      "line-height": "25px"
    });
    let anaImages = analysisImageUrl();
    let tmp = 0;
    let tmpK;
    for(let k in anaImages){
      let v = anaImages[k];
      if(v.length > tmp){
        tmp = v.length;
        tmpK = k;
      }
    }
    let renderImages = anaImages[tmpK];
    for(let i in renderImages){
      let w = 800;
      let h = (parseInt(renderImages[i].height) / (parseInt(renderImages[i].width) / w));
      $("#puzzleContent").append("<img class='puzzleImg' style='width:"+w+"px;height:"+h+"px;'" +
        "data-src='" + renderImages[i].url +"'>");
    }
    let domHeight = $("#puzzleContent").innerHeight();
    let randeredImgs = $(".puzzleImg");
    $("#puzzleContent").scroll(function () {
      let scrollTop = $("#puzzleContent").scrollTop();
      for(let i=0; i < randeredImgs.length; i++){
        if(randeredImgs[i].offsetTop < scrollTop + domHeight ){
          randeredImgs[i].src = randeredImgs[i].getAttribute('data-src');
        }
      }
    });
  }
}

$("#closeImg").click(function(){
  $("#puzzleImages").remove();
});
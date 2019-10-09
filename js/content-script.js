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
    }else if(request.event === "openNotePanel"){
      openNotePanel();
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

// 打开笔记操作界面
let global_bar_color;
let z_index = 0;
function openNotePanel() {
  $('body').append('<div class="note-panel">' +
    '<div class="note-bar" id="noteBar">' +
     '<span>标记：</span>' +
      '<div class="note-bar-item" id="barYellow" data="yellow"></div>' +
      '<div class="note-bar-item" id="barBlue" data="blue"></div>' +
      '<div class="note-bar-item" id="barRed" data="red"></div>' +
      '<div class="note-bar-item" id="barTrans" data="transparent"></div>' +
      '<div class="note-print" id="notePrint">保存</div>' +
      '<div class="note-close" id="noteClose">关闭</div>' +
    '</div>'
  );
  $("#notePrint").click(function (e) {
    $(".note-panel").remove();
    window.print();
  });
  $("#noteClose").click(function (e) {
    $(".note-panel").remove();
  });
  $(".note-bar-item").click(function (e) {
    $(".note-bar-item").removeClass("bar-active");
    $(e.target).addClass("bar-active");
    let note_bar_span = $(".note-bar-span");
    note_bar_span.css("cursor", "default");
    if($(e.target).attr("data") === "yellow"){
      console.log("select yellow");
      global_bar_color = "rgba(240, 163, 10, 0.8)";
    }else if($(e.target).attr("data") === "blue"){
      console.log("select blue");
      global_bar_color = "rgba(27, 161, 226, 0.8)";
    }else if($(e.target).attr("data") === "red"){
      console.log("select red");
      global_bar_color = "rgba(229, 20, 0, 0.8)"
    }else if($(e.target).attr("data") === "transparent"){
      global_bar_color = "#";
      note_bar_span.css("cursor", "pointer");
      note_bar_span.click((e) => {
        $(e.target).removeClass("note-bar-span");
        $(e.target).removeAttr("style");
      })
    }
  });
  $(document).on('mousedown', function(e) {}).on("mouseup", function (e) {
    changeBarColor();
  });
}

function changeBarColor() {
  let selector = window.getSelection();
  let selectStr = selector.toString();
  let range = selector.getRangeAt(0);
  if (selectStr.trim() !== "") {
    if(global_bar_color !== "#"){
      let temp = document.createElement('span');
      temp.style.cssText = "background: " + global_bar_color + ";z-index: " + z_index + ";";
      z_index ++;
      temp.className = "note-bar-span";
      // 将range的值赋值给temp
      range.surroundContents(temp);
    }
  }
}
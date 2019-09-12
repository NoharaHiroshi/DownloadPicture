function load() {
    window.console.info('popup load！');
}
window.onload = load();

// 打开后台页
$("#open_background").click(e => {
  getCurrentTab((tab) => {
    getCurrentImages(tab.id, () => {
      window.open(chrome.extension.getURL('background.html'));
    });
  });
});

// 智能拼页
$("#puzzle_images").click(e => {
  getCurrentTab((tab) => {
    puzzleImages(tab.id);
  });
});

// 保存数据到localStorage
function save(key, value) {
  localStorage[key] = JSON.stringify(value);
}

// 从localStorage获取数据
function get(key) {
  return JSON.parse(localStorage[key]);
}

// 获取当前页面Tab
function getCurrentTab(callback)
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
  {
    if(tabs.length){
      let tab = tabs[0];
      save("tab", tabs[0]);
      if(callback) callback(tab);
    }
  });
}

// 获取当前页面图片事件
function getCurrentImages(tabId, callback) {
  let req = {"event": "getImages"};
  chrome.tabs.sendMessage(tabId, req, function(response) {
    if(response){
      let images = response.result;
      console.log("getCurrentImages", images);
      save("images", images);
      if(callback) callback();
    }
  });
}

// 智能拼图事件
function puzzleImages(tabId, callback) {
  let req = {"event": "puzzleImages"};
  chrome.tabs.sendMessage(tabId, req, function(response) {
    if(response){
      console.log("puzzleImages");
      if(callback) callback();
    }
  });
}
$(".content").on('mousedown', function(e) {
  var $tar = $(e.target);
  if (!$tar.hasClass('selected')) {
    $.extend(this, {
      'multiLine': true,
      'startPos': {
        "x": e.pageX,
        "y": e.pageY
      },
      'endPos': {
        "x": e.pageX,
        "y": e.pageY
      }
    });
    $('body').append('<div class="multiLine"></div>');

  }
}).on('mousemove', function(e) {
  if (this.multiLine) {
    this.endPos = {
      "x": e.pageX,
      "y": e.pageY
    };
    let $mLine = $('.multiLine'),
      startX = this.startPos.x,
      startY = this.startPos.y,
      endX = this.endPos.x,
      endY = this.endPos.y,
      width = Math.abs(endX - startX) + "px",
      height = Math.abs(endY - startY) + "px",
      left = endX > startX ? startX : endX,
      top = endY > startY ? startY : endY;

    $mLine.css({
      position: 'absolute',
      width: width,
      height: height,
      left: left,
      top: top,
      outline: "1px dashed #f56c6c"
    });

    multiSelect()
  }

}).on('mouseup', function(e) {
  this.multiLine = false;
  $('.multiLine').remove();
});

$('.btn').click(function(e) {
  aline(0)
});

function multiSelect() {

  var domArr = document.querySelectorAll('.item'),
    $mLine = $('.multiLine'),
    mTop = $mLine.position().top,
    mLeft = $mLine.position().left,
    mTop2 = mTop + $mLine.height(),
    mLeft2 = mLeft + $mLine.width();

  domArr.forEach(function(e) {
    var $dom = $(e),
      left = $dom.position().left,
      top = $dom.position().top,
      left2 = left + $dom.width(),
      top2 = top + $dom.height();

    if (!(left > mLeft2 || left2 < mLeft || top > mTop2 || top2 < mTop)) {
      $dom.addClass('multi-selected');
    } else {
      $dom.removeClass('multi-selected');
    }

  })
}

function aline(num) {
  var multiArr = document.querySelectorAll('.multi-selected'),
    mTop = 9999,
    mLeft = 9999,
    mRight = 0,
    mBottom = 0;

  if (multiArr.length > 1) {
    multiArr.forEach(function(e) {
      var top = $(e).position().top;
      if (top < mTop) {
        mTop = top;
      }
    });
    $('.multi-selected').css({
      top: mTop
    })
  }
}
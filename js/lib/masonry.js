/*!
* Masonry v3.1.5
* Cascading grid layout library
* http://masonry.desandro.com
* MIT License
* by David DeSandro
*/(function(window){'use strict';var indexOf=Array.prototype.indexOf?function(items,value){return items.indexOf(value);}:function(items,value){for(var i=0,len=items.length;i<len;i++){var item=items[i];if(item===value){return i;}}
return-1;};function masonryDefinition(Outlayer,getSize){var Masonry=Outlayer.create('masonry');Masonry.prototype._resetLayout=function(){this.getSize();this._getMeasurement('columnWidth','outerWidth');this._getMeasurement('gutter','outerWidth');this.measureColumns();var i=this.cols;this.colYs=[];while(i--){this.colYs.push(0);}
this.maxY=0;};Masonry.prototype.measureColumns=function(){this.getContainerWidth();if(!this.columnWidth){var firstItem=this.items[0];var firstItemElem=firstItem&&firstItem.element;this.columnWidth=firstItemElem&&getSize(firstItemElem).outerWidth||this.containerWidth;}
this.columnWidth+=this.gutter;this.cols=Math.floor((this.containerWidth+this.gutter)/this.columnWidth);this.cols=Math.max(this.cols,1);};Masonry.prototype.getContainerWidth=function(){var container=this.options.isFitWidth?this.element.parentNode:this.element;var size=getSize(container);this.containerWidth=size&&size.innerWidth;};Masonry.prototype._getItemLayoutPosition=function(item){item.getSize();var remainder=item.size.outerWidth%this.columnWidth;var mathMethod=remainder&&remainder<1?'round':'ceil';var colSpan=Math[mathMethod](item.size.outerWidth/this.columnWidth);colSpan=Math.min(colSpan,this.cols);var colGroup=this._getColGroup(colSpan);var minimumY=Math.min.apply(Math,colGroup);var shortColIndex=indexOf(colGroup,minimumY);var position={x:this.columnWidth*shortColIndex,y:minimumY};var setHeight=minimumY+item.size.outerHeight;var setSpan=this.cols+1-colGroup.length;for(var i=0;i<setSpan;i++){this.colYs[shortColIndex+i]=setHeight;}
return position;};Masonry.prototype._getColGroup=function(colSpan){if(colSpan<2){return this.colYs;}
var colGroup=[];var groupCount=this.cols+1-colSpan;for(var i=0;i<groupCount;i++){var groupColYs=this.colYs.slice(i,i+colSpan);colGroup[i]=Math.max.apply(Math,groupColYs);}
return colGroup;};Masonry.prototype._manageStamp=function(stamp){var stampSize=getSize(stamp);var offset=this._getElementOffset(stamp);var firstX=this.options.isOriginLeft?offset.left:offset.right;var lastX=firstX+stampSize.outerWidth;var firstCol=Math.floor(firstX/this.columnWidth);firstCol=Math.max(0,firstCol);var lastCol=Math.floor(lastX/this.columnWidth);lastCol-=lastX%this.columnWidth?0:1;lastCol=Math.min(this.cols-1,lastCol);var stampMaxY=(this.options.isOriginTop?offset.top:offset.bottom)+
stampSize.outerHeight;for(var i=firstCol;i<=lastCol;i++){this.colYs[i]=Math.max(stampMaxY,this.colYs[i]);}};Masonry.prototype._getContainerSize=function(){this.maxY=Math.max.apply(Math,this.colYs);var size={height:this.maxY};if(this.options.isFitWidth){size.width=this._getContainerFitWidth();}
return size;};Masonry.prototype._getContainerFitWidth=function(){var unusedCols=0;var i=this.cols;while(--i){if(this.colYs[i]!==0){break;}
unusedCols++;}
return(this.cols-unusedCols)*this.columnWidth-this.gutter;};Masonry.prototype.needsResizeLayout=function(){var previousWidth=this.containerWidth;this.getContainerWidth();return previousWidth!==this.containerWidth;};return Masonry;}
if(typeof define==='function'&&define.amd){define(['outlayer/outlayer','get-size/get-size'],masonryDefinition);}else{window.Masonry=masonryDefinition(window.Outlayer,window.getSize);}})(window);
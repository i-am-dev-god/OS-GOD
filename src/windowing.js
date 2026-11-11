// Keep a portion of the title bar reachable, even after a small viewport resize.
export function clampWindowPosition(x,y,width,height,windowWidth,windowHeight){
 if(windowWidth===undefined||windowHeight===undefined)return {x:Math.max(0,Math.min(Math.max(0,width-120),x)),y:Math.max(0,Math.min(Math.max(0,height-55),y))};
 // Keep the entire frame in the usable desktop, or at least its title bar on a tiny viewport.
 const top=32,bottom=66;
 return {x:Math.max(0,Math.min(Math.max(0,width-windowWidth),x)),y:Math.max(Math.min(top,Math.max(0,height-55)),Math.min(Math.max(top,height-bottom-windowHeight),y))};
}
export function taskAction(window,activeId){return !window?'open':window.id===activeId&&!window.minimized?'minimize':'focus';}
export function snapBounds(side,width,height){const gap=10,top=48,bottom=68;const available=Math.max(240,width-3*gap),half=Math.floor(available/2);return {x:side==='right'?gap*2+half:gap,y:top,w:half,h:Math.max(200,height-top-bottom),positioned:true,maximized:false};}
// Calculate a compositor-friendly zoom from a note card to its final window.
export function noteZoom(from,to){
 if(!from||!to||![from.left,from.top,from.width,from.height,to.left,to.top,to.width,to.height].every(Number.isFinite)||from.width<=0||from.height<=0||to.width<=0||to.height<=0)return null;
 const scale=Math.max(.12,Math.min(.85,from.width/to.width,from.height/to.height));
 const x=from.left+from.width/2-to.left-to.width*scale/2;
 const y=from.top+from.height/2-to.top-to.height*scale/2;
 return {translate:`${x}px ${y}px`,scale:String(scale),transformOrigin:'top left'};
}
// Fit an existing frame in the middle of the available desktop.
export function centerBounds(width,height,windowWidth,windowHeight){
 const top=40,bottom=66,gap=8;
 const w=Math.max(0,Math.min(windowWidth,width-gap*2));
 const h=Math.max(0,Math.min(windowHeight,height-top-bottom));
 return {x:Math.max(gap,(width-w)/2),y:Math.max(top,top+(height-top-bottom-h)/2),w,h,positioned:true,maximized:false};
}
export function windowMorph(from,to){
 if(!from||!to||![from.left,from.top,from.width,from.height,to.left,to.top,to.width,to.height].every(Number.isFinite)||from.width<=0||from.height<=0||to.width<=0||to.height<=0)return null;
 return {translate:`${from.left-to.left}px ${from.top-to.top}px`,scale:`${from.width/to.width} ${from.height/to.height}`,transformOrigin:'top left'};
}

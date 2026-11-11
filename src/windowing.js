// Keep a portion of the title bar reachable, even after a small viewport resize.
export function clampWindowPosition(x,y,width,height,windowWidth,windowHeight){
 if(windowWidth===undefined||windowHeight===undefined)return {x:Math.max(0,Math.min(Math.max(0,width-120),x)),y:Math.max(0,Math.min(Math.max(0,height-55),y))};
 // Keep the entire frame in the usable desktop, or at least its title bar on a tiny viewport.
 const top=32,bottom=66;
 return {x:Math.max(0,Math.min(Math.max(0,width-windowWidth),x)),y:Math.max(Math.min(top,Math.max(0,height-55)),Math.min(Math.max(top,height-bottom-windowHeight),y))};
}
export function taskAction(window,activeId){return !window?'open':window.id===activeId&&!window.minimized?'minimize':'focus';}
export function snapBounds(side,width,height){const gap=10,top=48,bottom=68;const available=Math.max(240,width-3*gap),half=Math.floor(available/2);return {x:side==='right'?gap*2+half:gap,y:top,w:half,h:Math.max(200,height-top-bottom),positioned:true,maximized:false};}

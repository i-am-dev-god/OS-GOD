// Keep a portion of the title bar reachable, even after a small viewport resize.
export function clampWindowPosition(x,y,width,height){return {x:Math.max(0,Math.min(Math.max(0,width-120),x)),y:Math.max(0,Math.min(Math.max(0,height-55),y))};}
export function taskAction(window,activeId){return !window?'open':window.id===activeId&&!window.minimized?'minimize':'focus';}
export function snapBounds(side,width,height){const gap=10,top=48,bottom=68;const available=Math.max(240,width-3*gap),half=Math.floor(available/2);return {x:side==='right'?gap*2+half:gap,y:top,w:half,h:Math.max(200,height-top-bottom),positioned:true,maximized:false};}

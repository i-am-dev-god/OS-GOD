export const defaultPreferences={wallpaper:'dusk',accent:'lavender',icons:true,glass:true,motion:true,density:'comfortable',fontSize:13,taskbar:'center',blur:30,customWallpaper:'',dockSize:'medium',defaultView:'grid',sortBy:'recent',clock24:false,editorFont:'sans',theme:'system'};
export function normalizePreferences(input={}){
 const value={...defaultPreferences,...(input&&typeof input==='object'?input:{})};
 if(!['dusk','cloud','aurora','rose','custom'].includes(value.wallpaper))value.wallpaper='dusk';
 if(!['lavender','ocean','peach','mint'].includes(value.accent))value.accent='lavender';
 if(!['comfortable','compact'].includes(value.density))value.density='comfortable';
 if(!['center','left'].includes(value.taskbar))value.taskbar='center';
 if(!['system','light','dark'].includes(value.theme))value.theme='system';
 if(!['small','medium','large'].includes(value.dockSize))value.dockSize='medium';
 if(!['grid','list'].includes(value.defaultView))value.defaultView='grid';
 if(!['recent','oldest','title'].includes(value.sortBy))value.sortBy='recent';
 if(!['sans','serif','mono'].includes(value.editorFont))value.editorFont='sans';
 value.clock24=value.clock24===true;
 value.fontSize=Math.min(20,Math.max(12,Number(value.fontSize)||13));
 value.blur=Math.min(40,Math.max(0,Number.isFinite(Number(value.blur))?Number(value.blur):30));
 for(const key of ['icons','glass','motion'])value[key]=value[key]!==false;
 if(typeof value.customWallpaper!=='string'||!/^data:image\/(png|jpeg|webp);base64,/i.test(value.customWallpaper)||value.customWallpaper.length>1100000)value.customWallpaper='';
 if(value.wallpaper==='custom'&&!value.customWallpaper)value.wallpaper='dusk';
 return value;
}

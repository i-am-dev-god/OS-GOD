import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {createServer} from 'vite';

// Wait for React and its effects to settle without relying on CI machine speed.
async function waitFor(predicate,description,timeout=5000){
  const deadline=Date.now()+timeout;
  do {if(predicate())return;await new Promise(r=>setTimeout(r,20));} while(Date.now()<deadline);
  assert.fail(`Timed out waiting for ${description}`);
}

test('guest desktop and contextual account interactions',async()=>{
  const window=new Window({url:'http://localhost:5173/'});
  window.document.body.innerHTML='<div id="root"></div>';
  const animations=[];
  const originalRect=window.Element.prototype.getBoundingClientRect;
  window.Element.prototype.getBoundingClientRect=function(){if(this.classList?.contains('task-app')||this.classList?.contains('desktop-shortcut'))return {left:20,top:60,width:50,height:50,right:70,bottom:110};if(this.classList?.contains('library-window'))return this.classList.contains('maximized')?{left:0,top:32,width:1200,height:700,right:1200,bottom:732}:{left:100,top:80,width:800,height:550,right:900,bottom:630};if(this.classList?.contains('note-card'))return {left:100,top:100,width:200,height:140,right:300,bottom:240};if(this.classList?.contains('utility-window'))return {left:250,top:80,width:600,height:500,right:850,bottom:580};return originalRect.call(this)};
  window.Element.prototype.animate=function(frames,options){animations.push({target:this,frames,options});return {cancel(){}}};
  for(const name of ['window','document','navigator','location','localStorage','HTMLElement','Element','Event','MouseEvent']) Object.defineProperty(globalThis,name,{value:window[name],configurable:true,writable:true});
  const server=await createServer({configFile:'vite.config.js',server:{middlewareMode:true},appType:'custom',logLevel:'silent'});
  const q=selector=>window.document.querySelector(selector);
  const button=(selector,label)=>[...window.document.querySelectorAll(selector)].find(n=>n.textContent.includes(label));
  const click=selector=>{const el=q(selector);assert.ok(el,`Missing ${selector}`);el.click();return el};
  let module;
  try {
    module=await server.ssrLoadModule('/src/main.jsx');
    await waitFor(()=>q('.desktop'),'guest desktop');
    assert.equal(q('.os-window'),null,'desktop is visible on startup');assert.equal(window.document.querySelectorAll('.desktop-shortcut').length,2,'only Notes and Settings shortcuts');
    click('.task-app[aria-label="Notes"]');
    await waitFor(()=>q('.library-window'),'guest workspace');
    click('.note-card');
    await waitFor(()=>q('.title-input')&&animations.some(a=>a.target.classList.contains('utility-window')),'note zoom into editor');
    assert.equal(animations.filter(a=>a.target.classList.contains('utility-window')).at(-1).options.duration,620,'note zoom is slower and deliberate');
    const firstZoom=animations.filter(a=>a.target.classList.contains('utility-window')).length;
    click('.note-card');
    await waitFor(()=>animations.filter(a=>a.target.classList.contains('utility-window')).length>firstZoom,'existing note zooms again');
    click('.utility-window [aria-label="Close"]');await waitFor(()=>!q('.title-input'),'close opened note');
    const searchToggle=click('[aria-label="Open note search"]');
    await waitFor(()=>searchToggle.getAttribute('aria-expanded')==='true'&&window.document.activeElement===q('[aria-label="Search notes"]'),'expanded note search');
    click('.library-window [aria-label="Maximize"]');
    await waitFor(()=>q('.library-window.maximized'),'maximized window');assert.ok(animations.some(a=>a.target.classList.contains('library-window')&&a.options.duration===440),'maximize animates');
    click('.library-window [aria-label="Restore window"]');
    await waitFor(()=>!q('.library-window.maximized'),'restored window');

    click('.primary-button');
    await waitFor(()=>q('.title-input'),'new note editor');
    assert.equal(window.document.querySelectorAll('.os-window').length,2);
    click('[aria-label="Add to favorites"]');
    await waitFor(()=>q('[aria-label="Remove favorite"]')?.getAttribute('aria-pressed')==='true','favorite toggle');
    await waitFor(()=>JSON.parse(window.localStorage.getItem('stillspace:notes:guest')||'[]').some(n=>n.title===''&&n.body===''&&n.starred),'favorite saved locally');
    const sort=q('[aria-label="Sort notes"]');assert.ok(sort);sort.value='title';sort.dispatchEvent(new window.Event('change',{bubbles:true}));
    await waitFor(()=>JSON.parse(window.localStorage.getItem('stillspace:desktop')||'{}').sortBy==='title','sort preference');
    click('[aria-label="List view"]');
    await waitFor(()=>q('[aria-label="List view"]')?.getAttribute('aria-pressed')==='true'&&q('.notes-grid.list-view'),'list view');
    const favorites=button('.primary-nav button','Favorites');assert.ok(favorites);favorites.click();
    await waitFor(()=>q('.library-heading h1')?.textContent==='Favorites'&&q('.note-card'),'favorites filter');
    assert.equal(window.document.querySelectorAll('.task-app[aria-label="Notes"]').length,1,'notes share one taskbar button');
    click('.utility-window [aria-label="Minimize"]');await waitFor(()=>!q('.title-input'),'minimized editor');
    click('.task-app[aria-label="Notes"]');await waitFor(()=>q('[aria-label="Notes windows"]'),'grouped note windows');
    const noteTask=button('.notes-switcher button','Untitled note');assert.ok(noteTask);noteTask.click();await waitFor(()=>q('.title-input'),'restored editor');

    const shortcut=button('.desktop-shortcut','Settings');assert.ok(shortcut);shortcut.click();
    await waitFor(()=>q('.settings-nav')&&button('.settings-nav button','Workspace')?.getAttribute('aria-current')==='page','workspace settings');assert.ok(animations.some(a=>a.target.getAttribute('aria-label')==='Settings'&&a.options.duration===520),'settings opens from its icon');
    button('.settings-nav button','Data & account').click();await waitFor(()=>button('.data-actions button','Import text')&&button('.data-actions button','Export notes'),'data and account controls');
    assert.ok(button('.settings-nav button','Appearance'));button('.settings-nav button','Appearance').click();await waitFor(()=>q('.wallpaper-options button:nth-child(3)'),'appearance settings');
    click('.wallpaper-options button:nth-child(3)');await waitFor(()=>q('.desktop.wall-aurora'),'wallpaper selection');
    const dark=button('.segmented button','Dark');assert.ok(dark);dark.click();
    await waitFor(()=>q('.theme-dark')&&JSON.parse(window.localStorage.getItem('stillspace:desktop')||'{}').theme==='dark','dark theme');
    button('.settings-nav button','Workspace').click();await waitFor(()=>button('.segmented button','Large'),'workspace controls');
    const large=button('.segmented button','Large');assert.ok(large);large.click();
    await waitFor(()=>q('.dock-large')&&JSON.parse(window.localStorage.getItem('stillspace:desktop')||'{}').dockSize==='large','dock size');
    const mono=button('.segmented button','Mono');assert.ok(mono);mono.click();await waitFor(()=>q('.editor-font-mono'),'editor typeface');
    const compact=button('.segmented button','Compact');assert.ok(compact);compact.click();await waitFor(()=>q('.density-compact'),'compact density');
    const motion=click('[aria-label="Toggle fluid motion"]');await waitFor(()=>q('.motion-off')&&motion.getAttribute('aria-pressed')==='false','motion setting');
    const beforeReduced=animations.length;click('.note-card');await waitFor(()=>q('.utility-window.is-active .title-input'),'note opens without animation');assert.equal(animations.length,beforeReduced,'motion setting disables note zoom');
    motion.click();await waitFor(()=>!q('.motion-off')&&motion.getAttribute('aria-pressed')==='true','motion restored');
    const layoutTrigger=q('.library-window [aria-label="Maximize"]');layoutTrigger.focus();await waitFor(()=>q('[aria-label="Window layout"]'),'window layout menu');window.document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await waitFor(()=>!q('[aria-label="Window layout"]'),'layout menu dismissed');layoutTrigger.blur();layoutTrigger.focus();await waitFor(()=>q('[aria-label="Window layout"]'),'layout menu reopened');const snap=button('.layout-menu button','Snap left');assert.ok(snap);snap.click();await waitFor(()=>q('.library-window').style.left==='10px','snapped window');

    click('.command-trigger');await waitFor(()=>q('[aria-label="Command palette"]'),'command palette');
    const input=q('[aria-label="Search commands"]');assert.equal(input.getAttribute('aria-activedescendant'),'command-result-0');
    input.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));
    await waitFor(()=>input.getAttribute('aria-activedescendant')==='command-result-1','command selection');
    input.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    await waitFor(()=>!q('[aria-label="Command palette"]'),'command palette closure');
    const account=q('.top-profile'),count=window.document.querySelectorAll('.os-window').length;account.click();
    await waitFor(()=>q('.account-popover .auth-form')&&window.document.activeElement===q('[aria-label="Close account"]'),'contextual account panel and focus');
    assert.equal(window.document.querySelectorAll('.os-window').length,count,'account does not open a new window');
    // A pending search action must not steal focus from the account panel later.
    await new Promise(r=>setTimeout(r,180));
    assert.equal(window.document.activeElement.getAttribute('aria-label'),'Close account','search must not steal focus from account');
    const signup=button('.account-popover .auth-tabs button','Create account');assert.ok(signup);signup.click();
    await waitFor(()=>q('.account-popover .auth-submit')?.textContent.trim()==='Create your account','signup form');
    window.document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    await waitFor(()=>!q('.account-popover')&&window.document.activeElement===account,'account escape and focus return');
    window.dispatchEvent(new window.KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true}));
    await waitFor(()=>q('[aria-label="Command palette"]')&&window.document.activeElement===q('[aria-label="Search commands"]'),'system-wide keyboard search');
    assert.ok(button('.command-list button','Personalize desktop'),'system search includes settings');
    assert.ok(button('.command-list button','Open favorites'),'system search includes collections');
    const search=q('[aria-label="Search commands"]');
    const setValue=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setValue.call(search,'Little things');search.dispatchEvent(new window.Event('input',{bubbles:true}));
    await waitFor(()=>button('.command-list button','Little things worth keeping'),'system search finds notes');
    setValue.call(search,'settings');search.dispatchEvent(new window.Event('input',{bubbles:true}));
    await waitFor(()=>button('.command-list button','Personalize desktop'),'system search finds apps by category');
    window.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    await waitFor(()=>!q('[aria-label="Command palette"]'),'system search dismissal');
    click('.sidebar-profile');await waitFor(()=>q('.account-popover'),'sidebar account panel');
    window.document.body.dispatchEvent(new window.Event('pointerdown',{bubbles:true}));
    await waitFor(()=>!q('.account-popover'),'outside dismissal');
    click('.task-app[aria-label="Open launcher"]');await waitFor(()=>q('.start-menu'),'launcher');
    const accountApp=button('.start-apps button','Account');assert.ok(accountApp);accountApp.click();
    await waitFor(()=>q('.account-popover .auth-form')&&!q('.start-menu'),'launcher account panel');
    click('.popover-close');await waitFor(()=>!q('.account-popover')&&window.document.activeElement===account,'fallback focus after launcher closes');
  } finally {module?.root?.unmount();const {cloud}=await server.ssrLoadModule('/src/cloud.js');cloud.auth.stopAutoRefresh();cloud.auth.broadcastChannel?.close();cloud.realtime.disconnect();await server.close();await window.happyDOM.abort();}
});

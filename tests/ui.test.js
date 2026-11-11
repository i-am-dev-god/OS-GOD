import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {createServer} from 'vite';

test('guest desktop opens notes, creates a note, and changes its wallpaper',async()=>{
  const window=new Window({url:'http://localhost:5173/'});
  window.document.body.innerHTML='<div id="root"></div>';
  for(const name of ['window','document','navigator','location','localStorage','HTMLElement','Element','Event','MouseEvent']) Object.defineProperty(globalThis,name,{value:window[name],configurable:true,writable:true});
  const server=await createServer({configFile:'vite.config.js',server:{middlewareMode:true},appType:'custom',logLevel:'silent'});
  let module;
  try {
    module=await server.ssrLoadModule('/src/main.jsx');
    for(let i=0;i<30&&!window.document.querySelector('.library-window');i++) await new Promise(r=>setTimeout(r,20));
    assert.ok(window.document.querySelector('.library-window'),'guest workspace opened');
    const searchToggle=window.document.querySelector('[aria-label="Open note search"]');assert.ok(searchToggle);assert.equal(searchToggle.getAttribute('aria-expanded'),'false');searchToggle.click();await new Promise(r=>setTimeout(r,30));assert.equal(searchToggle.getAttribute('aria-expanded'),'true');assert.equal(window.document.activeElement.getAttribute('aria-label'),'Search notes');
    const maximize=window.document.querySelector('.library-window [aria-label="Maximize"]');maximize.click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('.library-window.maximized'));const restore=window.document.querySelector('.library-window [aria-label="Restore window"]');assert.ok(restore);restore.click();await new Promise(r=>setTimeout(r,30));assert.equal(window.document.querySelector('.library-window.maximized'),null);

    const newButton=window.document.querySelector('.primary-button');assert.ok(newButton);newButton.click();
    for(let i=0;i<40&&!window.document.querySelector('.title-input');i++) await new Promise(r=>setTimeout(r,25));
    assert.ok(window.document.querySelector('.title-input'),'editor opened: '+window.document.body.textContent.slice(-500));
    assert.equal(window.document.querySelectorAll('.os-window').length,2);
    const favorite=window.document.querySelector('[aria-label="Add to favorites"]');assert.ok(favorite);favorite.click();await new Promise(r=>setTimeout(r,30));assert.equal(window.document.querySelector('[aria-label="Remove favorite"]').getAttribute('aria-pressed'),'true');assert.ok(JSON.parse(window.localStorage.getItem('stillspace:notes:guest')).some(n=>n.title===''&&n.starred),'favorite is saved');
    const sort=window.document.querySelector('[aria-label="Sort notes"]');assert.ok(sort);sort.value='title';sort.dispatchEvent(new window.Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,30));assert.equal(JSON.parse(window.localStorage.getItem('stillspace:desktop')).sortBy,'title');
    const list=window.document.querySelector('[aria-label="List view"]');list.click();await new Promise(r=>setTimeout(r,30));assert.equal(list.getAttribute('aria-pressed'),'true');assert.ok(window.document.querySelector('.notes-grid.list-view'));
    const favorites=[...window.document.querySelectorAll('.primary-nav button')].find(n=>n.textContent.includes('Favorites'));favorites.click();await new Promise(r=>setTimeout(r,30));assert.equal(window.document.querySelector('.library-heading h1').textContent,'Favorites');assert.ok(window.document.querySelector('.note-card'));
    const saved=JSON.parse(window.localStorage.getItem('stillspace:notes:guest'));assert.ok(saved.some(n=>n.title===''&&n.body===''),'new note saved locally');
    const editorTask=[...window.document.querySelectorAll('.task-app')].find(n=>n.title==='Untitled note');assert.ok(editorTask);editorTask.click();await new Promise(r=>setTimeout(r,30));assert.equal(window.document.querySelector('.title-input'),null,'taskbar minimizes editor');editorTask.click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('.title-input'),'taskbar restores editor');
    const shortcut=[...window.document.querySelectorAll('.desktop-shortcut')].find(n=>n.textContent.includes('Settings'));shortcut.click();
    await new Promise(r=>setTimeout(r,30));
    const aurora=window.document.querySelector('.wallpaper-options button:nth-child(3)');assert.ok(aurora);aurora.click();
    await new Promise(r=>setTimeout(r,30));
    assert.ok(window.document.querySelector('.desktop.wall-aurora'));
    const dark=[...window.document.querySelectorAll('.segmented button')].find(n=>n.textContent==='Dark');assert.ok(dark);dark.click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('.theme-dark'));assert.equal(JSON.parse(window.localStorage.getItem('stillspace:desktop')).theme,'dark');
    const large=[...window.document.querySelectorAll('.segmented button')].find(n=>n.textContent==='Large');assert.ok(large);large.click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('.dock-large'));assert.equal(JSON.parse(window.localStorage.getItem('stillspace:desktop')).dockSize,'large');
    const mono=[...window.document.querySelectorAll('.segmented button')].find(n=>n.textContent==='Mono');mono.click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('.editor-font-mono'));
    const compact=[...window.document.querySelectorAll('.segmented button')].find(n=>n.textContent==='Compact');assert.ok(compact);compact.click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('.density-compact'));
    const snap=window.document.querySelector('[aria-label="Snap window left"]');assert.ok(snap);snap.click();await new Promise(r=>setTimeout(r,30));assert.equal(window.document.querySelector('.library-window').style.left,'10px');
    window.document.querySelector('.command-trigger').click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('[aria-label="Command palette"]'));
    const commandInput=window.document.querySelector('[aria-label="Search commands"]');assert.equal(commandInput.getAttribute('aria-activedescendant'),'command-result-0');commandInput.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));await new Promise(r=>setTimeout(r,30));assert.equal(commandInput.getAttribute('aria-activedescendant'),'command-result-1');commandInput.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await new Promise(r=>setTimeout(r,30));assert.equal(window.document.querySelector('[aria-label="Command palette"]'),null);
    const account=window.document.querySelector('.top-profile');account.click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('.auth-form'),'guest can open sign-in');
  } finally {module?.root?.unmount();const {cloud}=await server.ssrLoadModule('/src/cloud.js');cloud.auth.stopAutoRefresh();cloud.auth.broadcastChannel?.close();cloud.realtime.disconnect();await server.close();await window.happyDOM.abort();}
});

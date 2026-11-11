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
    const newButton=window.document.querySelector('.primary-button');assert.ok(newButton);newButton.click();
    for(let i=0;i<40&&!window.document.querySelector('.title-input');i++) await new Promise(r=>setTimeout(r,25));
    assert.ok(window.document.querySelector('.title-input'),'editor opened: '+window.document.body.textContent.slice(-500));
    assert.equal(window.document.querySelectorAll('.os-window').length,2);
    const saved=JSON.parse(window.localStorage.getItem('stillspace:notes:guest'));assert.ok(saved.some(n=>n.title===''&&n.body===''),'new note saved locally');
    const editorTask=[...window.document.querySelectorAll('.task-app')].find(n=>n.title==='Untitled note');assert.ok(editorTask);editorTask.click();await new Promise(r=>setTimeout(r,30));assert.equal(window.document.querySelector('.title-input'),null,'taskbar minimizes editor');editorTask.click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('.title-input'),'taskbar restores editor');
    const shortcut=[...window.document.querySelectorAll('.desktop-shortcut')].find(n=>n.textContent.includes('Settings'));shortcut.click();
    await new Promise(r=>setTimeout(r,30));
    const aurora=window.document.querySelector('.wallpaper-options button:nth-child(3)');assert.ok(aurora);aurora.click();
    await new Promise(r=>setTimeout(r,30));
    assert.ok(window.document.querySelector('.desktop.wall-aurora'));
    const compact=[...window.document.querySelectorAll('.segmented button')].find(n=>n.textContent==='Compact');assert.ok(compact);compact.click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('.density-compact'));
    const snap=window.document.querySelector('[aria-label="Snap window left"]');assert.ok(snap);snap.click();await new Promise(r=>setTimeout(r,30));assert.equal(window.document.querySelector('.library-window').style.left,'10px');
    window.document.querySelector('.command-trigger').click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('[aria-label="Command palette"]'));
    const account=window.document.querySelector('.top-profile');account.click();await new Promise(r=>setTimeout(r,30));assert.ok(window.document.querySelector('.auth-form'),'guest can open sign-in');
  } finally {module?.root?.unmount();const {cloud}=await server.ssrLoadModule('/src/cloud.js');cloud.auth.stopAutoRefresh();cloud.auth.broadcastChannel?.close();cloud.realtime.disconnect();await server.close();await window.happyDOM.abort();}
});

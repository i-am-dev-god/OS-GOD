import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function worker({online=true}={}) {
  const handlers={};
  const old={ok:true,body:'offline cached page'},fresh={ok:true,body:'fresh page'},asset={ok:true,body:'cached asset'};
  const scope='https://example.test/OS-GOD/';
  const caches={match:async req=>typeof req==='string'&&req===scope+'index.html'?old:req.url?.endsWith('.js')?asset:undefined};
  const self={location:{origin:'https://example.test'},registration:{scope},addEventListener:(name,fn)=>{handlers[name]=fn;}};
  const fetch=async()=>{if(!online)throw new Error('offline');return fresh;};
  const source=readFileSync(new URL('../src/offline-worker.js',import.meta.url),'utf8').replace('__ASSETS__','[]');
  vm.runInNewContext(source,{self,caches,fetch,URL,Response});
  return {handlers,old,fresh,asset};
}
async function request(w,mode,url){let response;w.handlers.fetch({request:{method:'GET',mode,url},respondWith:p=>{response=p;}});return response;}
test('navigation loads fresh page when online',async()=>{const w=worker();assert.equal(await request(w,'navigate','https://example.test/OS-GOD/'),w.fresh);});
test('navigation falls back to cached page when offline',async()=>{const w=worker({online:false});assert.equal(await request(w,'navigate','https://example.test/OS-GOD/?x=1'),w.old);});
test('versioned assets still use offline cache',async()=>{const w=worker({online:false});assert.equal(await request(w,'no-cors','https://example.test/OS-GOD/assets/app.js'),w.asset);});

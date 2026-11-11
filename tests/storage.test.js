import {test} from 'node:test';import assert from 'node:assert/strict';import {encodeNote,decodeNote,mergeNotes,noteSize} from '../src/storage.js';
test('lossless encoding preserves unicode and notes',()=>{const n={id:'1',title:'नमस्ते 🌱',body:'Hello world! '.repeat(200),deleted:false};const packed=encodeNote(n);assert.deepEqual(decodeNote(packed),n);assert.ok(packed.startsWith('g:'));});
test('short notes do not get larger merely to compress',()=>{const n={body:'ok'};assert.equal(encodeNote(n).startsWith('j:'),true);assert.deepEqual(decodeNote(encodeNote(n)),n);});
test('merge keeps newest notes and tombstones',()=>{const old={id:'x',updatedAt:'2026-01-01T00:00:00Z',body:'old'}, newer={...old,updatedAt:'2026-01-02T00:00:00Z',deleted:true};assert.deepEqual(mergeNotes([old],[newer]),[newer]);assert.deepEqual(mergeNotes([newer],[old]),[newer]);});
test('compression stats ignore deleted notes',()=>{assert.deepEqual(noteSize([{deleted:true,body:'x'}]),{original:0,stored:0});});

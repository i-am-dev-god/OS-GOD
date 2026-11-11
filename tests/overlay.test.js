import {test} from 'node:test';
import assert from 'node:assert/strict';
import {overlayPosition} from '../src/overlay.js';
test('places panels below or above the trigger and keeps them in view',()=>{
 assert.deepEqual(overlayPosition({left:40,top:30,bottom:50},{width:300,height:200},{width:1000,height:700}),{left:40,top:58,side:'below'});
 assert.deepEqual(overlayPosition({left:950,top:650,bottom:680},{width:300,height:200},{width:1000,height:700}),{left:692,top:442,side:'above'});
 assert.deepEqual(overlayPosition({left:4,top:100,bottom:130},{width:380,height:600},{width:320,height:400}),{left:8,top:8,side:'below'});
});

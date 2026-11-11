import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validCode,hostOnlySdp,hostPair} from '../src/direct.js';

test('pairing codes are exactly 16 hexadecimal digits',()=>{assert.equal(validCode('0123456789abcdef'),true);assert.equal(validCode('abc'),false);assert.equal(validCode('0123456789abcdeg'),false);});
test('signaling strips relay and server reflexive candidates',()=>{const sdp='v=0\r\na=candidate:1 1 udp 123 192.168.1.2 123 typ host\r\na=candidate:2 1 udp 123 1.2.3.4 123 typ srflx\r\na=candidate:3 1 udp 123 1.2.3.4 123 typ relay\r\n';const result=hostOnlySdp(sdp);assert.match(result,/typ host/);assert.doesNotMatch(result,/typ srflx|typ relay/);});
test('connection must report host candidates on both ends',async()=>{const make=(local,remote)=>({getStats:async()=>new Map([['transport',{type:'transport',selectedCandidatePairId:'pair'}],['pair',{localCandidateId:'local',remoteCandidateId:'remote'}],['local',{candidateType:local}],['remote',{candidateType:remote}]])});assert.equal(await hostPair(make('host','host')),true);assert.equal(await hostPair(make('host','relay')),false);assert.equal(await hostPair({getStats:async()=>new Map()}),false);});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {nodes,statements} from '../data/knowledge.mjs';
import {buildModel} from '../assets/live-data-v04.mjs';
import {ancestry,members,project,findPath,searchStatements} from '../assets/core.mjs';

const json=f=>JSON.parse(readFileSync(new URL('../data/'+f,import.meta.url)));
const inputs=()=>[
  json('atlas.json'),json('registry-v0.1.json'),json('democracy-batch-001.json'),json('release-v0.3.json'),
  [json('mathematics-batch-001.json'),json('mathematics-batch-002.json'),json('mathematics-batch-003.json')],
  json('mathematics-semantics-v0.1.json'),json('release-v0.4.json')
];
const make=(edit=()=>{})=>{const args=inputs();edit(...args);return buildModel(nodes,statements,...args);};
const m=make(),all=project(m.nodes.map(n=>n.id),m.nodes,m.statements);
for(const [file,sha] of [
 ['mathematics-batch-001.json','7cc1f6aeeb4d022343b35ae48fc92155a9cc87ed'],
 ['mathematics-batch-002.json','f1d3bc133e64d39d354cdd5d6c688ba2cf083fac'],
 ['mathematics-batch-003.json','889d70953456922a13d4f0c37bc3997a4a463cc4'],
 ['mathematics-semantics-v0.1.json','91fc8d6806d2c3991def67c12030a22328358357']
])test('exact staged Mathematics blob: '+file,()=>{const b=readFileSync(new URL('../data/'+file,import.meta.url));assert.equal(createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex'),sha);});

test('v0.4 projects 67 nodes and 46 statements without changing legacy identities',()=>{
 assert.equal(m.nodes.length,67);assert.equal(m.statements.length,46);
 nodes.forEach(n=>assert.equal(m.nodes.find(x=>x.id===n.id),n));
 statements.forEach(s=>assert.equal(m.statements.find(x=>x.id===s.id),s));
});
test('Formal Systems routes through Mathematics to prime numbers',()=>{
 assert.deepEqual(ancestry('prime-numbers',m.atlas).map(x=>x.id),['formal','mathematics','prime-numbers']);
 assert.equal(members('formal',m.atlas).length,24);assert.equal(m.atlas.journeys.length,5);
 assert.ok(!m.atlas.realms.find(r=>r.id==='formal').planned.includes('Mathematics'));
});
test('prior region coverage remains intact',()=>{
 assert.equal(members('society',m.atlas).length,10);assert.equal(members('nature',m.atlas).length,11);assert.equal(members('mind',m.atlas).length,11);
});
test('Mathematics preview contains 24 nodes, 12 statements and 12 sources',()=>{
 assert.equal(m.nodes.filter(n=>n.domain==='mathematics').length,24);
 assert.equal(m.statements.filter(s=>s.kind==='mathematics_preview').length,12);
 assert.equal(m.mathSources.length,12);assert.equal(m.allSources.length,16);
});
test('every Mathematics statement keeps an attestation and blocked staging flag',()=>{
 for(const s of m.statements.filter(s=>s.kind==='mathematics_preview')){const e=m.evidenceFor(s.id);assert.ok(e&&e.attestations.length&&e.sources.length);assert.equal(e.record.publication_allowed,false);}
});
test('Mathematical status stays on propositions',()=>{
 assert.ok(!m.nodes.some(n=>['Theorem','Conjecture'].includes(n.type)));
 const status=new Map(m.mathStatuses.map(a=>[a.proposition,a.status]));
 assert.equal(status.get('MATH:P:INFINITE_PRIMES'),'proved');assert.equal(status.get('MATH:P:RIEMANN_HYPOTHESIS'),'open');
 assert.equal(status.get('MATH:P:ALL_PRIMES_ODD'),'refuted');assert.equal(status.get('MATH:P:EUCLID_LEMMA_NAT'),'proved');
});
test('same infinitude proposition has two distinct proof records',()=>{
 const pc=m.proofComparison;assert.equal(pc.proposition,'MATH:P:INFINITE_PRIMES');assert.equal(pc.proofs.length,2);
 assert.equal(pc.same_conclusion,true);assert.equal(pc.automatically_equivalent_proofs,false);assert.equal(new Set(pc.proofs.map(p=>p.method_family)).size,2);
 const proofs=m.mathProofs.filter(p=>p.conclusion===pc.proposition);assert.equal(proofs.length,2);assert.notDeepEqual(proofs[0].depends_on,proofs[1].depends_on);
});
test('counterexample preserves target proposition and witness',()=>{
 const c=m.mathCounterexamples.find(x=>x.id==='MATH:CX:TWO_REFUTES_ALL_PRIMES_ODD');
 assert.equal(c.target_proposition,'MATH:P:ALL_PRIMES_ODD');assert.equal(c.witness,'MATH:N:TWO');assert.ok(m.nodes.some(n=>n.id===c.target_proposition));
});
test('Euclid lemma assessment retains conditional scope',()=>{
 const a=m.mathStatuses.find(x=>x.proposition==='MATH:P:EUCLID_LEMMA_NAT');assert.equal(a.status,'proved');assert.match(a.scope,/Conditional proposition/);
});
test('proof, source work and formal artifact remain distinct roles',()=>{
 assert.equal(m.nodes.find(n=>n.id==='MATH:PRF:EUCLID_IX20').type,'Proof');
 assert.equal(m.nodes.find(n=>n.id==='MATH:FA:INFINITE_PRIMES').type,'FormalArtifact');
 assert.equal(m.nodes.find(n=>n.id==='MATH:W:EUCLID_ELEMENTS_HEATH').type,'Work');
});
test('Euclid and Euler proof edges both reach one proposition in directed mode',()=>{
 assert.equal(findPath(all,'MATH:PRF:EUCLID_IX20','MATH:P:INFINITE_PRIMES',true).steps.length,1);
 assert.equal(findPath(all,'MATH:PRF:EULER_ANALYTIC_INFINITE_PRIMES','MATH:P:INFINITE_PRIMES',true).steps.length,1);
});
test('Mathematics has no invented bridge to Gravity or Love',()=>{
 assert.equal(findPath(all,'MATH:P:INFINITE_PRIMES','G01'),null);assert.equal(findPath(all,'MATH:P:INFINITE_PRIMES','L01'),null);
});
test('declared Mathematics relation candidates disable automatic truth inference',()=>{
 for(const r of m.mathSemantics.relation_candidates.filter(x=>'automatic_truth_inference' in x))assert.equal(r.automatic_truth_inference,false);
});
test('display authorization does not change staged publication state',()=>{
 assert.equal(m.release04.authorization.demo_display_authorized,true);assert.equal(m.release04.authorization.verified_knowledge_publication,false);assert.ok(m.mathBatches.every(b=>b.publication_allowed===false));
});
test('missing preview authorization fails closed',()=>assert.throws(()=>make((a,r,d,r3,mb,sem,r4)=>r4.authorization.demo_display_authorized=false),/authorized/));
test('verified-knowledge promotion fails closed',()=>assert.throws(()=>make((a,r,d,r3,mb,sem,r4)=>r4.authorization.verified_knowledge_publication=true),/authorized/));
test('changed statement staging flag rejected',()=>assert.throws(()=>make((a,r,d,r3,mb)=>mb[0].statements[0].publication_allowed=true),/staging/));
test('primitive Theorem node type rejected',()=>assert.throws(()=>make((a,r,d,r3,mb)=>mb[0].nodes.find(n=>n.id==='MATH:P:INFINITE_PRIMES').type='Theorem'),/Theorem/));
test('automatic proof equivalence promotion rejected',()=>assert.throws(()=>make((a,r,d,r3,mb)=>mb[2].proof_comparison.automatically_equivalent_proofs=true),/comparison guard/));
test('unallowlisted Mathematics statement rejected',()=>assert.throws(()=>make((a,r,d,r3,mb)=>mb[2].statements.push({...mb[2].statements[0],id:'MATH:EXTRA'})),/allowlist/));
test('dangling Mathematics statement rejected',()=>assert.throws(()=>make((a,r,d,r3,mb)=>mb[2].statements[0].object='MATH:MISSING'),/Dangling/));
test('retrieval finds stored Euler-product material',()=>{const hits=searchStatements('Euler product',all);assert.ok(hits.some(s=>s.id==='MATH:ST:011'));assert.ok(hits.every(s=>all.statements.includes(s)));});

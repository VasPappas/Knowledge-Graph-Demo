/** Atlas v0.4 projection: v0.3 + Mathematics review preview. */
import {buildModel as buildV03,freeze,safeURL} from './live-data-v03.mjs';
import {validate} from './core.mjs';
export {safeURL};

const demand=(condition,message)=>{if(!condition)throw Error(message);};
const unique=(rows,name)=>{demand(Array.isArray(rows),`Missing ${name}`);const ids=new Set(rows.map(r=>r.id));demand(ids.size===rows.length,`Duplicate ${name}`);return ids;};

export function buildModel(seedNodes,seedStatements,baseAtlas,registry,democracyBatch,release03,mathBatches,mathSemantics,release04){
  const base=buildV03(seedNodes,seedStatements,baseAtlas,registry,democracyBatch,release03);
  demand(release04.authorization?.mode==='public_review_preview'&&release04.authorization.demo_display_authorized===true&&release04.authorization.verified_knowledge_publication===false,'Mathematics preview not authorized');
  demand(mathSemantics.version===release04.mathematics.semantics.version,'Mathematics semantics version mismatch');
  demand(Array.isArray(mathBatches)&&mathBatches.length===release04.mathematics.batches.length,'Mathematics batch count mismatch');
  const expectedBatchIds=new Set(release04.mathematics.batches.map(b=>b.id));
  demand(mathBatches.every(b=>expectedBatchIds.has(b.batch_id)&&b.publication_allowed===false),'Mathematics staging policy or batch ID changed');
  demand(mathBatches.every(b=>b.state==='private_review_candidate'),'Mathematics review state changed');

  const mathNodes=mathBatches.flatMap(b=>b.nodes||[]);
  const mathSources=mathBatches.flatMap(b=>b.sources||[]);
  const mathStatements=mathBatches.flatMap(b=>b.statements||[]);
  const mathAttestations=mathBatches.flatMap(b=>b.attestations||[]);
  const mathProofs=mathBatches.flatMap(b=>b.proofs||[]);
  const mathFormalizations=mathBatches.flatMap(b=>b.formalizations||[]);
  const mathDefinitions=mathBatches.flatMap(b=>b.definition_records||[]);
  const mathCounterexamples=mathBatches.flatMap(b=>b.counterexamples||[]);
  const mathStatuses=mathBatches.flatMap(b=>[...(b.status_assessments||[]),...(b.proposition_status_assessments||[])]);
  const nodeIds=unique(mathNodes,'Mathematics nodes'),sourceIds=unique(mathSources,'Mathematics sources'),statementIds=unique(mathStatements,'Mathematics statements'),attestationIds=unique(mathAttestations,'Mathematics attestations');
  unique(mathProofs,'Mathematics proofs');unique(mathFormalizations,'Mathematics formalizations');unique(mathDefinitions,'Mathematics definitions');unique(mathCounterexamples,'Mathematics counterexamples');unique(mathStatuses,'Mathematics status assessments');
  demand(!mathNodes.some(n=>['Theorem','Conjecture'].includes(n.type)),'Theorem/conjecture must remain proposition status, not primitive node type');
  demand(!mathNodes.some(n=>base.nodes.some(x=>x.id===n.id)),'Mathematics node collides with an existing Atlas node');

  const allowed=new Set(release04.mathematics.allowed_statement_ids);
  demand(allowed.size===release04.mathematics.allowed_statement_ids.length&&allowed.size===statementIds.size&&[...statementIds].every(id=>allowed.has(id)),'Mathematics preview allowlist mismatch');
  const nodeMap=new Map(mathNodes.map(n=>[n.id,n])),sourceMap=new Map(mathSources.map(s=>[s.id,s]));
  for(const source of mathSources)demand(safeURL(source.url)&&source.edition&&source.locator,'Invalid Mathematics source');
  const relationIds=new Set(mathSemantics.relation_candidates.map(r=>r.id));
  relationIds.add('R_DOCUMENT_STATES');

  for(const st of mathStatements){
    demand(nodeIds.has(st.subject)&&nodeIds.has(st.object),'Dangling Mathematics statement '+st.id);
    demand(st.publication_allowed===false,'Mathematics statement staging flag changed');
    demand(relationIds.has(st.relation),'Unknown Mathematics relation '+st.relation);
    if(st.relation==='R_DOCUMENT_STATES')demand(nodeMap.get(st.subject)?.type==='Work'&&nodeMap.get(st.object)?.type==='Proposition','Mathematics document statement endpoint type mismatch');
  }
  for(const at of mathAttestations)demand(statementIds.has(at.statement_id)&&sourceIds.has(at.source_id)&&at.locator,'Invalid Mathematics attestation '+at.id);

  for(const p of mathProofs){
    demand(nodeIds.has(p.id)&&nodeMap.get(p.id)?.type==='Proof'&&nodeIds.has(p.conclusion),'Invalid Mathematics proof '+p.id);
    for(const dep of p.depends_on||[])demand(nodeIds.has(dep),'Unknown Mathematics proof dependency '+dep);
    const refs=[...(p.representation_sources||[]),...(p.representation_source?[p.representation_source]:[])];
    demand(refs.length&&refs.every(id=>sourceIds.has(id)),'Mathematics proof source missing');
  }
  for(const f of mathFormalizations)demand(nodeIds.has(f.formal_artifact)&&nodeIds.has(f.mathematical_content)&&nodeIds.has(f.formal_system)&&sourceIds.has(f.source_id),'Invalid Mathematics formalization '+f.id);
  for(const d of mathDefinitions)demand(nodeIds.has(d.term)&&sourceIds.has(d.source_id),'Invalid Mathematics definition '+d.id);
  for(const c of mathCounterexamples){
    demand(nodeIds.has(c.target_proposition)&&nodeIds.has(c.witness)&&(c.witness_facts||[]).every(id=>nodeIds.has(id)),'Invalid Mathematics counterexample '+c.id);
    demand(c.effect==='refutes_universal_proposition','Counterexample effect changed');
  }
  for(const a of mathStatuses)demand(nodeIds.has(a.proposition)&&['proved','open','conjectured','refuted','conditional'].includes(a.status),'Invalid Mathematics proposition status '+a.id);

  const mathEvidence=new Map();
  for(const st of mathStatements){
    const ats=mathAttestations.filter(a=>a.statement_id===st.id);
    demand(ats.length>0,'Missing Mathematics attestation '+st.id);
    mathEvidence.set(st.id,{record:st,attestations:ats,sources:[...new Set(ats.map(a=>a.source_id))].map(id=>sourceMap.get(id))});
  }

  const desc=n=>{
    if(n.type==='Proposition')return n.content||'Mathematical proposition. Inspect status, proof and source context.';
    if(n.type==='Proof')return 'A derivation record, distinct from the source that represents it and from its conclusion proposition.';
    if(n.type==='Counterexample')return 'A counterexample record that preserves the refuted proposition rather than deleting it.';
    if(n.type==='FormalArtifact')return 'A formal proof-assistant artifact or declaration; documentation inspection is distinct from local recompilation.';
    if(n.type==='FormalSystem')return 'A formal-system context used to encode mathematical definitions or propositions.';
    if(n.type==='MathematicalObject')return 'A mathematical object used as a witness in this review preview.';
    if(n.type==='Work')return 'A historical mathematical work or textual source context.';
    return 'A mathematical concept in the prime-number and proof pilot.';
  };
  const displayRelation=id=>({
    R_DOCUMENT_STATES:'document states',
    MATH_R_PROOF_USES:'proof uses',
    MATH_R_PROOF_ESTABLISHES:'proof establishes',
    MATH_R_FORMALIZES:'formalizes'
  }[id]||id);

  const addedNodes=mathNodes.map(n=>({...n,domain:'mathematics',desc:desc(n)}));
  const addedStatements=mathStatements.map(st=>({
    id:st.id,s:st.subject,o:st.object,r:displayRelation(st.relation),relationId:st.relation,qualifiers:st.qualifiers||{},
    status:'AI source/structure checked; independent mathematical review pending',
    why:nodeMap.get(st.object)?.content||st.qualifiers?.scope||'Mathematical relationship preserved from the staged review record.',
    kind:'mathematics_preview'
  }));
  const nodes=[...base.nodes,...addedNodes],statements=[...base.statements,...addedStatements];
  const atlas=structuredClone(base.atlas);atlas.version='0.4';atlas.topics.push(...structuredClone(release04.atlas_extension.topics));atlas.mappings.push(structuredClone(release04.atlas_extension.mapping));atlas.journeys.push(structuredClone(release04.atlas_extension.journey));
  validate(nodes,statements,atlas);
  const fullNodeMap=new Map(nodes.map(n=>[n.id,n]));
  const generalDefs=[...registry.relations,...registry.patterns];
  const mathRelationDefs=mathSemantics.relation_candidates.map(r=>({...r,math:true,aliases:[r.id],family:'mathematics',context:[],required_roles:r.roles||[]}));

  function mathRelationFor(id){
    if(id==='R_DOCUMENT_STATES')return generalDefs.find(d=>d.id===id)||null;
    return mathRelationDefs.find(d=>d.id===id)||null;
  }
  function decisionFor(st){
    if(st.kind!=='mathematics_preview')return base.decisionFor(st);
    const d=mathRelationFor(st.relationId);
    if(!d)return{state:'unmapped',definition:null,missing:['definition'],pending:{}};
    if(st.relationId==='R_DOCUMENT_STATES'){
      const fit=(types,id)=>types.includes('*')||types.includes(fullNodeMap.get(id)?.type);
      if(!fit(d.domain,st.s)||!fit(d.range,st.o))return{state:'type_mismatch',definition:d,missing:['endpoint type review'],pending:{}};
      return{state:'mathematics_documentary_preview',definition:d,missing:(d.context||[]).filter(key=>!st.qualifiers?.[key]),pending:{}};
    }
    return{state:'mathematics_structured_preview',definition:d,missing:[],pending:{}};
  }

  const statusFor=id=>mathStatuses.filter(a=>a.proposition===id);
  const mathInfoFor=id=>({
    statuses:statusFor(id),
    definitions:mathDefinitions.filter(d=>d.term===id),
    proofs:mathProofs.filter(p=>p.id===id||p.conclusion===id),
    formalizations:mathFormalizations.filter(f=>f.formal_artifact===id||f.mathematical_content===id||f.formal_system===id),
    counterexamples:mathCounterexamples.filter(c=>c.id===id||c.target_proposition===id||c.witness===id||(c.witness_facts||[]).includes(id))
  });
  const proofComparison=mathBatches.map(b=>b.proof_comparison).find(Boolean)||null;
  demand(proofComparison?.same_conclusion===true&&proofComparison.automatically_equivalent_proofs===false,'Proof comparison guard missing');
  demand(proofComparison.proofs.every(p=>nodeIds.has(p.proof_id)),'Proof comparison points to missing proof');
  demand(new Set(proofComparison.proofs.map(p=>p.method_family)).size===proofComparison.proofs.length,'Proof method families collapsed');

  const allSources=[...base.batch.sources.map(s=>({...s,collection:'democracy'})),...mathSources.map(s=>({...s,collection:'mathematics'}))];
  return {
    ...base,
    nodes:freeze(nodes),statements:freeze(statements),atlas:freeze(atlas),
    release04:freeze(release04),mathBatches:freeze(mathBatches),mathSemantics:freeze(mathSemantics),
    mathSources:freeze(mathSources),allSources:freeze(allSources),mathProofs:freeze(mathProofs),
    mathStatuses:freeze(mathStatuses),mathFormalizations:freeze(mathFormalizations),mathDefinitions:freeze(mathDefinitions),mathCounterexamples:freeze(mathCounterexamples),
    proofComparison:freeze(proofComparison),decisionFor,
    evidenceFor:id=>base.evidenceFor(id)||mathEvidence.get(id)||null,
    mathInfoFor,mathRelationFor,
    sourceById:id=>base.batch.sources.find(s=>s.id===id)||sourceMap.get(id)||null
  };
}

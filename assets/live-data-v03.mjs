/** Read-only public preview projection. No migration or fact promotion. */
import {validate} from './core.mjs';
export function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
const demand=(condition,message)=>{if(!condition)throw Error(message);};
const unique=(rows,name)=>{demand(Array.isArray(rows),`Missing ${name}`);const ids=new Set(rows.map(r=>r.id));demand(ids.size===rows.length,`Duplicate ${name}`);return ids;};
export function safeURL(value){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}}
export function buildModel(seedNodes,seedStatements,baseAtlas,registry,batch,release){
  demand(release.authorization?.mode==='public_review_preview'&&release.authorization.demo_display_authorized===true&&release.authorization.verified_knowledge_publication===false,'Preview not authorized');
  demand(batch.batch_id===release.batch.id&&registry.version===release.registry.version&&batch.registry_version===registry.version,'Version or batch mismatch');
  demand(registry.policy.inference_enabled===false&&registry.policy.automatic_rewrite===false&&registry.policy.family_entails_relation===false,'Inference must remain disabled');
  demand(registry.policy.publication_allowed===false&&batch.publication_allowed===false,'Original staging policy changed');
  const defs=[...registry.relations,...registry.patterns];unique(defs,'definitions');const aliases=new Map();
  for(const def of defs)for(const alias of def.aliases){demand(!aliases.has(alias),'Ambiguous alias');aliases.set(alias,def);}
  const bnodes=unique(batch.nodes,'batch nodes'), srcIds=unique(batch.sources,'sources'),stIds=unique(batch.statements,'batch statements'),atIds=unique(batch.attestations,'attestations');unique(batch.assessments,'assessments');
  const allowed=new Set(release.allowed_statement_ids);
  demand(allowed.size===release.allowed_statement_ids.length&&allowed.size===stIds.size&&[...stIds].every(id=>allowed.has(id)),'Preview allowlist mismatch');
  const bmap=new Map(batch.nodes.map(n=>[n.id,n]));const srcById=new Map(batch.sources.map(s=>[s.id,s]));
  for(const source of batch.sources){demand(bmap.get(source.work_id)?.type==='Work','Source work missing');demand(safeURL(source.url)&&source.edition,'Invalid source URL/edition');}
  for(const at of batch.attestations){demand(stIds.has(at.statement_id)&&srcIds.has(at.source_id),'Attestation reference missing');demand(at.check_scope==='document_content_only'&&at.evidence_type==='documentary'&&at.stance==='supports_document_content_attribution','Attestation scope changed');}
  for(const as of batch.assessments){demand(stIds.has(as.statement_id)&&as.basis.length&&as.basis.every(id=>atIds.has(id)&&batch.attestations.find(a=>a.id===id).statement_id===as.statement_id),'Assessment basis missing or mismatched');demand(as.status==='AI_text_checked_pending_independent_review'&&as.world_implementation==='not_assessed','Review status was promoted');}
  const evidence=new Map();
  for(const st of batch.statements){
    const c=st.content,q=c.qualifiers;
    demand(bnodes.has(c.subject)&&bnodes.has(c.object)&&bmap.get(c.subject).type==='Work'&&bmap.get(c.object).type==='Proposition','Invalid document/proposition endpoints');
    demand(c.relation==='R_DOCUMENT_STATES'&&registry.relations.some(r=>r.id===c.relation),'Invalid documentary predicate');
    demand(st.workflow_status==='awaiting_independent_review'&&st.publication_allowed===false,'Statement status changed');
    demand(q.claim_scope==='document_content_only'&&q.locator&&q.edition&&q.document_time&&q.population,'Missing documentary scope');
    const ats=batch.attestations.filter(a=>a.statement_id===st.id),ases=batch.assessments.filter(a=>a.statement_id===st.id);
    demand(ats.length>0&&ases.length>0,'Missing review chain');
    for(const at of ats){const src=srcById.get(at.source_id);demand(src.work_id===c.subject&&src.edition===q.edition&&at.locator===q.locator,'Edition/locator/work mismatch');}
    demand(bmap.get(c.object).document_time===q.document_time&&bmap.get(c.object).population===q.population,'Proposition scope mismatch');
    evidence.set(st.id,{record:st,attestations:ats,assessments:ases,sources:[...new Set(ats.map(a=>a.source_id))].map(id=>srcById.get(id))});
  }
  const addedNodes=batch.nodes.map(n=>({...n,domain:'democracy',desc:n.type==='Proposition'?`Bounded paraphrase of document content, not a standalone finding: ${n.text}`:'A historical document in the six-passage pilot. Inspect a connection for the exact passage and source.'}));
  const addedStatements=batch.statements.map(st=>({id:st.id,s:st.content.subject,o:st.content.object,r:'document states',relationId:st.content.relation,qualifiers:st.content.qualifiers,status:'AI text checked; independent review pending',why:bmap.get(st.content.object).text,kind:'documentary_preview'}));
  const nodes=[...seedNodes,...addedNodes],statements=[...seedStatements,...addedStatements];
  const atlas=structuredClone(baseAtlas);atlas.version='0.3';atlas.topics.push(...structuredClone(release.atlas_extension.topics));atlas.mappings.push(structuredClone(release.atlas_extension.mapping));atlas.journeys.push(structuredClone(release.atlas_extension.journey));
  validate(nodes,statements,atlas);
  const nodeMap=new Map(nodes.map(n=>[n.id,n]));
  function decisionFor(st){
    const d=st.relationId?defs.find(r=>r.id===st.relationId):aliases.get(st.r);
    if(!d)return{state:'unmapped',definition:null,missing:['definition'],pending:{}};
    if(d.required_roles){const missing=d.required_roles.filter(role=>!d.bind[role]||!st[d.bind[role]]);return{state:'held_for_roles',definition:d,missing:[...missing,...d.context.filter(key=>!st.qualifiers?.[key])],pending:d.pending_qualifiers?.[st.r]||{}};}
    const fit=(types,id)=>types.includes('*')||types.includes(nodeMap.get(id)?.type);
    if(!fit(d.domain,st.s)||!fit(d.range,st.o))return{state:'type_mismatch',definition:d,missing:['endpoint type review'],pending:{}};
    return{state:st.kind==='documentary_preview'?'typed_documentary_preview':'candidate_binary',definition:d,missing:d.context.filter(key=>!st.qualifiers?.[key]),pending:{}};
  }
  return {nodes:freeze(nodes),statements:freeze(statements),atlas:freeze(atlas),registry:freeze(registry),batch:freeze(batch),release:freeze(release),decisionFor,evidenceFor:id=>evidence.get(id)||null};
}

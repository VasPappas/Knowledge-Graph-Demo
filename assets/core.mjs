/** Pure, dependency-free graph and atlas operations. Navigation never adds edges. */
export function validate(nodes, statements, atlas) {
  const unique = (rows, name) => {const ids=new Set(rows.map(r=>r.id)); if(ids.size!==rows.length) throw Error(`Duplicate ${name} ID`); return ids;};
  const nodeIds=unique(nodes,'node'); unique(statements,'statement');
  for(const s of statements) if(!nodeIds.has(s.s)||!nodeIds.has(s.o)) throw Error(`Dangling statement ${s.id}`);
  const items=[...atlas.realms,...atlas.topics], ids=unique(items,'atlas'); unique(atlas.mappings,'mapping');
  for(const m of atlas.mappings) {
    if(new Set(m.nodeIds).size!==m.nodeIds.length) throw Error(`Duplicate member in ${m.id}`);
    if(!m.nodeIds.every(id=>nodeIds.has(id))||!m.nodeIds.includes(m.focus)) throw Error(`Invalid mapping ${m.id}`);
  }
  for(const t of atlas.topics) {
    if(!ids.has(t.parent)) throw Error(`Unknown parent ${t.parent}`);
    if(t.mapping&&!atlas.mappings.some(m=>m.id===t.mapping)) throw Error(`Unknown mapping ${t.mapping}`);
    ancestry(t.id,atlas);
  }
  return true;
}
export function ancestry(id, atlas) {
  const result=[],seen=new Set();
  while(id) {if(seen.has(id)) throw Error('Atlas cycle'); seen.add(id); const item=[...atlas.realms,...atlas.topics].find(t=>t.id===id); if(!item) throw Error(`Unknown topic ${id}`); result.unshift(item); id=item.parent;}
  return result;
}
export function mappingFor(topicId, atlas) {const t=atlas.topics.find(t=>t.id===topicId); return atlas.mappings.find(m=>m.id===t?.mapping);}
export function members(id, atlas) {
  const direct=mappingFor(id,atlas); if(direct) return [...direct.nodeIds];
  return [...new Set(atlas.topics.filter(t=>t.parent===id).flatMap(t=>members(t.id,atlas)))];
}
export function project(nodeIds, nodes, statements) {const ids=new Set(nodeIds);return {nodes:nodes.filter(n=>ids.has(n.id)),statements:statements.filter(s=>ids.has(s.s)&&ids.has(s.o))};}
export function memberships(id, atlas) {return atlas.topics.filter(t=>mappingFor(t.id,atlas)?.nodeIds.includes(id));}
export function findPath(graph, start, end, directed=false) {
  const adjacency=new Map(graph.nodes.map(n=>[n.id,[]])); if(!adjacency.has(start)||!adjacency.has(end)) return null;
  for(const s of graph.statements) {adjacency.get(s.s).push({node:s.o,statement:s,reverse:false}); if(!directed) adjacency.get(s.o).push({node:s.s,statement:s,reverse:true});}
  const queue=[start], previous=new Map([[start,null]]);
  for(let i=0;i<queue.length;i++) {const u=queue[i]; if(u===end) break; for(const step of adjacency.get(u)) if(!previous.has(step.node)){previous.set(step.node,{from:u,...step});queue.push(step.node);}}
  if(!previous.has(end)) return null;
  const ns=[end],steps=[];for(let cursor=end;previous.get(cursor);) {const step=previous.get(cursor);steps.unshift(step);cursor=step.from;ns.unshift(cursor);}
  return {nodes:ns,steps};
}
export function searchStatements(question, graph) {
  const stop=new Set(['the','and','from','with','what','how','did','does','our','was','are','this','that','why']);
  const terms=[...new Set(question.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(t=>t.length>2&&!stop.has(t)))];
  const by=new Map(graph.nodes.map(n=>[n.id,n]));
  return graph.statements.map(s=>{const text=[by.get(s.s)?.name,s.r,by.get(s.o)?.name,s.why].join(' ').toLowerCase();return {statement:s,score:terms.reduce((n,t)=>n+Number(text.includes(t)),0)};}).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,7).map(r=>r.statement);
}
export function historyFor(statement, audit) {
  return {illustrative:audit.illustrativeHistories.includes(statement.id), entries:statement.history||[]};
}

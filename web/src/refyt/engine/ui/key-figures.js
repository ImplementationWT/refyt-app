// Refyt · v5.36: cada fila de cifras clave con el estilo de Capacity and staffing.
import {
  TODAY, VERSIONS, ico, wrapRender
} from "../index.js";
/* =================== v5.36: every row of key figures in the Capacity and staffing card style =================== */
export function kpi86(){ document.querySelectorAll('.cstats .stat').forEach(s => { if(s.classList.contains('k70')) return; s.classList.add('k70'); const lab = ((s.querySelector('small') || {}).textContent || '').toLowerCase(), t = ['tred', 'ta', 'tg', 'tb', 'tk'].find(c => s.classList.contains(c)) || 'tk';
  const ic = /overdue|expired|below|alert|risk|blocked|over the|hold/.test(lab) ? 'alert' : /propert|house|in close|in install|queue/.test(lab) ? 'home' : /meeting|staff|people|supplier/.test(lab) ? 'users' : /£|value|margin|quot|cost|invoic|spend|budget|owed|won|rate|payment/.test(lab) ? 'money' : /waiting|upcoming|due|soon|pending|book|today|next|to /.test(lab) ? 'clock' : /paid|done|complete|valid|approved|on target|matched|closed|assessed|in date/.test(lab) ? 'check' : t === 'tred' ? 'alert' : t === 'tg' ? 'check' : t === 'ta' ? 'clock' : 'grid';
  s.insertAdjacentHTML('afterbegin', `<span class="k70-i">${ico(ic, 19, 2.2)}</span>`); }); }
{ wrapRender(r86 => (...x) => { const o = r86(...x); try { kpi86(); } catch(e) {} return o; }); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.35') v.url = 'https://claude.ai/artifact/FbM6p6e79kJfh9p9WJjfya'; } });
VERSIONS.push({v:'v5.36', date:TODAY, major:false, current:true, url:null, title:'Key figures in the Capacity and staffing style', sum:'Every row of key figures uses the Capacity and staffing card: a soft tint by status, an icon in a white tile, the number large and the label underneath.', steps:[]});

// Refyt · Formularios de obra.
import {
  A, DB, IN, S, TODAY, fmtDy, his, prOf, render, toast
} from "../../index.js";

A.mp = el => { S.f.mp = el.dataset.v; render(); };
IN.mph = t => { const p = prOf(S.f.mp || 'PR-2018'); p.ph2 = p.ph2 || []; [...(t.files || [])].forEach(f => p.ph2.push(`${f.name}, ${fmtDy(TODAY)} 10:42, 51.59 N 0.08 E`)); his(p, `${t.files.length} site photos uploaded with location and time`, 'akr'); render(); toast('Photos saved with location and time.'); };
A.mFlag = el => { const p = prOf(el.dataset.v); DB.tk.push({id:'TK-' + (++DB.seq.tk), t:`Problem flagged on site: ${p.ad}`, r:'inc', due:TODAY, src:'Site form', done:false}); render(); toast('Flagged. The Install coordinator has a task.'); };

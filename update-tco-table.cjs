const fs = require('fs');
const path = 'src/components/PriceAuditsTab.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `                            {!row.isTarget && <div className="text-[10px] text-slate-400 font-medium">Match: {row.conf} • {row.freshness}</div>}
                            {row.isTarget && <div className="text-[10px] text-slate-400 font-medium">Target Listing</div>}`;

const replacement = `                            {!row.isTarget && <div className="text-[10px] text-slate-400 font-medium flex items-center gap-2">Match: {row.conf} • {row.freshness} {row.url && <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-0.5">Open Source <ExternalLink className="w-2.5 h-2.5" /></a>}</div>}
                            {row.isTarget && <div className="text-[10px] text-slate-400 font-medium flex items-center gap-2">Target Listing {row.url && <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-0.5">Open Source <ExternalLink className="w-2.5 h-2.5" /></a>}</div>}`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);

const E=require('./engine'),d=require('./data.json'),a=require('assert');
const r=E.compare({model:"갤럭시 S26",carrier:"KT",dataGB:30,contractEnd:"2027-04-16",family:true,today:new Date("2026-10-16")},d,24);
a.equal(r.options.length,3);a.equal(r.remaining,6);
r.options.forEach(o=>a.equal(o.total,Math.round(o.device+o.subsidy+o.interest+o.plan+o.addon+o.family+o.penalty)));
a.ok(E.installment(1000000,0,24).interest===0);
console.log('ok',r.options.map(o=>o.name+':'+o.total).join(', '));

const CHAMBERS={
 civ:{name:'Civilian Council',views:{
  a:{label:'By constituency',groups:[
   ['Hemes Arbora districts',72,'#d9a441','Native constituencies. The Minister President is drawn from this bloc.'],
   ['Descendant communities',50,'#4aa8ff','Districts of CIS personnel descendants.'],
   ['Industrial districts',30,'#e8832a','Geonosian engineers, Quarren shipwrights and foundry towns.'],
   ['Sanctuary districts',28,'#a287e0','Refugees and exiles taken in over the centuries.']],
   note:'No single bloc reaches the 91 seats needed for a majority, so the Minister President is elected by coalition.'},
  b:{label:'By caucus',groups:[
   ['Continuance Mainstream',76,'#4aa8ff','Supports the Permanent Emergency and the Protocol of Continued Concealment.'],
   ['Resource Commons',20,'#e8832a','Presses on shortages, luxuries and the black market.'],
   ['Open Skies',44,'#38d6ff','Largest opposition caucus. Argues the age of concealment is ending after the Republic\'s collapse, and leads the opposition alliance.'],
   ['Charter Strict',30,'#dfe9f6','Wants tighter limits on emergency powers and the veto. Allied with Open Skies.'],
   ['Independents',10,'#7f93ab','No caucus.']],
   note:'The Mainstream and Resource Commons together hold 96 seats and form the governing coalition, five above the 91 needed. Open Skies is the main opposition and leads an alliance with Charter Strict that holds 74 seats, or 84 with the Independents, still short of a majority. The Supreme Commander may still dissolve the Council in a declared emergency.'}}},
 mil:{name:'Military Senate',views:{
  a:{label:'By delegation',groups:[
   ['Droid Command Corps',30,'#38d6ff','Droid commanders descended from the CIS command droids.'],
   ['Fleet',26,'#f5b800','Navy, Droid Starfighter Corps and Boarding & Assault Corps.'],
   ['Ground & Defense',28,'#d04a3a','Droid Army, Commando Corps and Planetary Defense Command.'],
   ['Intelligence & Security',8,'#7f8cff','Naval and Army Intelligence, Security Bureau and Cryptology.'],
   ['Support commands',12,'#c9772e','Engineering, Logistics &amp; Foundry, Medical, R&amp;D and Signals.'],
   ['Droid Liaison Service',6,'#dfe9f6','Organic officers who oversee droid commands.'],
   ['Charter Guard',4,'#8fb8ff','Protects the constitutional offices.'],
   ['Defense officials',6,'#ff9f2e','Officials who carry the defense business of the Supreme Commander\'s Office.']],
   note:'The Droid Command Corps is the largest delegation, but the Liaison Service\'s officers can veto droid orders that touch civilian life or the Charter. The Marshal of the Brotherhood attends as a non-voting liaison, and the Senate distrusts the Order.'},
  b:{label:'By member type',groups:[
   ['Droid commanders',54,'#38d6ff','Droid officers sitting for every branch.'],
   ['Organic officers',60,'#e6eef8','Senior human and alien officers, including the Liaison Service.'],
   ['Defense officials',6,'#ff9f2e','Officials who carry the defense business of the Supreme Commander\'s Office.']],
   note:'Droid commanders hold 54 of 120 seats and need 7 more for a majority of 61. Their reliability is by design: each droid officer pairs with an organic liaison.'}}}};
function hemi(g){var N=g.reduce(function(s,x){return s+x[1]},0),R=N>150?7:6,r0=.42,rs=[],sum=0,i,j,pts=[],cnt;
 for(i=0;i<R;i++){rs.push(r0+(1-r0)*i/(R-1));sum+=rs[i]}
 cnt=rs.map(function(r){return Math.round(N*r/sum)});cnt[R-1]+=N-cnt.reduce(function(a,b){return a+b},0);
 for(i=0;i<R;i++)for(j=0;j<cnt[i];j++)pts.push({a:Math.PI-Math.PI*(j+.5)/cnt[i],r:rs[i]});
 pts.sort(function(p,q){return q.a-p.a||p.r-q.r});
 var sr=Math.min(190*(1-r0)/(R-1),Math.PI*r0*190/cnt[0])*.4,gi=0,used=0,o='';
 pts.forEach(function(p){while(used>=g[gi][1]){gi++;used=0}used++;
  o+='<circle class="seat" data-g="'+gi+'" cx="'+(200+190*p.r*Math.cos(p.a)).toFixed(1)+'" cy="'+(205-190*p.r*Math.sin(p.a)).toFixed(1)+'" r="'+sr.toFixed(1)+'" fill="'+g[gi][2]+'"><title>'+g[gi][0].replace(/&amp;/g,'&')+'</title></circle>'});
 return '<svg class="hemi" viewBox="0 0 400 215">'+o+'<text x="200" y="182" text-anchor="middle" class="hn">'+N+'</text><text x="200" y="199" text-anchor="middle" class="hl">SEATS · MAJORITY '+(Math.floor(N/2)+1)+'</text></svg>'}
function drawChamber(el,key,v){var c=CHAMBERS[key],V=c.views[v],N=V.groups.reduce(function(s,x){return s+x[1]},0);
 el.innerHTML='<div class="ch-head"><b>'+c.name+'</b></div><div class="views">'+Object.keys(c.views).map(function(k){return '<button data-v="'+k+'" class="'+(k===v?'on':'')+'">'+c.views[k].label+'</button>'}).join('')+'</div>'+hemi(V.groups)+'<div class="legend">'+V.groups.map(function(x,i){return '<div data-g="'+i+'"><i style="background:'+x[2]+'"></i><span><b>'+x[0]+'</b> <em class="mono">'+x[1]+' · '+(x[1]/N*100).toFixed(1)+'%</em><small>'+x[3]+'</small></span></div>'}).join('')+'</div><p class="cnote">'+V.note+'</p>';
 [].forEach.call(el.querySelectorAll('.views button'),function(b){b.onclick=function(){drawChamber(el,key,b.dataset.v)}});
 [].forEach.call(el.querySelectorAll('.legend div'),function(d){function on(f){[].forEach.call(el.querySelectorAll('.seat'),function(s){s.style.opacity=f&&s.dataset.g!==d.dataset.g?.18:1})}d.onmouseenter=function(){on(1)};d.onmouseleave=function(){on(0)}})}
var CH=document.getElementById('chambers');['civ','mil'].forEach(function(k){var d=document.createElement('div');d.className='hud chamber';CH.appendChild(d);drawChamber(d,k,'a')});
Object.keys(BRANCHES).forEach(function(k){var b=BRANCHES[k];if(typeof b.ranks==='string')b.ranks=b.ranks.split(';')});
var GOV=['SUP','admin','treasury','judge','const_','assembly'],RB=document.getElementById('reg-branches'),RO=document.getElementById('reg-out'),DL=document.getElementById('dossier'),DB=document.getElementById('dbody');
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function fmt(t){return t.split('\n\n').map(function(blk){var ls=blk.split('\n'),hd='',out='',li='';
 if(/^[A-Z][A-Z0-9 &'\-.,()\/\[\]:|]+$/.test(ls[0])&&ls[0].length<70){hd='<div class="dh mono">'+esc(ls[0].replace(/:$/,''))+'</div>';ls=ls.slice(1)}
 ls.forEach(function(l){if(/^ • /.test(l))li+='<li>'+esc(l.slice(3))+'</li>';else{if(li){out+='<ul>'+li+'</ul>';li=''}if(l.trim())out+='<p>'+esc(l)+'</p>'}});
 return hd+out+(li?'<ul>'+li+'</ul>':'')}).join('')}
function openDossier(title,sub,ins,text,extra){DB.innerHTML='<div class="dtop"><div class="dins">'+ins+'</div><div><div class="rn">'+esc(title)+'</div><div class="mono rt">'+esc(sub)+'</div></div></div><div class="dtext">'+fmt(text)+'</div>'+(extra||'');DL.classList.add('show');DL.scrollTop=0}
function closeD(){DL.classList.remove('show');DB.innerHTML=''}
document.getElementById('dclose').onclick=closeD;DL.onclick=function(e){if(e.target===DL)closeD()};document.addEventListener('keydown',function(e){if(e.key==='Escape')closeD()});
function openRank(k,n){if(n==='SUP'){var o=OFFICES.SUP();return openDossier(o[0],o[1],o[2],o[3])}var b=BRANCHES[k],i=b.ranks.indexOf(n),t=TIERS[i];openDossier(n,b.name+' · '+t,createInsignia(t,k),describeRank(k,t)+'\n\nADDRESSED AS:\n'+addressFor(k,t))}
function regBranch(k){
 [].forEach.call(RB.children,function(x){x.classList.toggle('on',x.dataset.k===k)});
 if(k==='SUP'){RO.innerHTML='<div class="hud"><div class="rhead"><div class="dins">'+createInsignia('SUPREME')+'</div><div><div class="rn">Supreme Commander Vexis</div><div class="mono rt">HEAD OF STATE · OFFICE OF THE SUPREME COMMANDER · FO-6</div></div></div><div class="dtext">'+fmt(SUPREME_TEXT.replace(/OFFICE: OFFICE OF THE SUPREME COMMANDER/,'THE OFFICE IS VEXIS')+'\n\n'+LIFE.SUP)+'</div></div>';return}
 var b=BRANCHES[k],f=FAMILIES[b.fam],cards='',rows='',hd='';
 [['OVERVIEW',b.intro],['HERITAGE',b.heritage],['MISSION',b.mission],['ORGANIZATION',b.org],['CHAIN OF COMMAND',b.chain],['REPORTS TO',b.reports],['ASSETS',b.assets],['DOCTRINE',b.doctrine],['TRAINING',b.training],['NOTABLE OFFICES',b.notable],['TRADITIONS',b.traditions]].forEach(function(c){if(c[1])cards+='<div class="card hud"><div class="k mono">'+c[0]+'</div><p>'+esc(c[1])+'</p></div>'});
 cards+='<div class="card hud"><div class="k mono">CORE DUTIES</div><ul>'+b.duties.map(function(d){return '<li>'+esc(d)+'</li>'}).join('')+'</ul></div>';
 var fm=['FO','SO','JO','MID','WO','NCO','E'].filter(function(x){return unitsFor(b,x).length}).map(function(x){return '<div class="k mono" style="margin-top:6px">'+UNIT_LABEL[x]+'</div><ul>'+unitsFor(b,x).map(function(u){return '<li>'+esc(u)+'</li>'}).join('')+'</ul>'}).join('');
 if(fm)cards+='<div class="card hud"><div class="k mono">FORMATIONS, TOP TO BOTTOM</div>'+fm+'</div>';
 TIERS.forEach(function(t,i){if(TIER_GROUPS[t])hd=TIER_GROUPS[t];var n=b.ranks[i];if(!n||n==='-')return;
  if(hd){rows+='<tr class="gh"><td colspan="3" class="mono">'+hd+'</td></tr>';hd=''}
  rows+='<tr class="rk-row" tabindex="0" data-t="'+t+'"><td class="ins">'+createInsignia(t,k)+'</td><td class="mono">'+t+'</td><td><b>'+esc(n)+'</b></td></tr>'});
 RO.innerHTML='<div class="rhead"><span class="sw" style="background:'+f.bg+';border-color:'+f.mark+'"></span><div><div class="rn">'+b.name+'</div><div class="mono rt">'+b.fam.toUpperCase()+' FAMILY</div></div></div>'+briefHTML(k)+'<details class="hud"><summary>Branch record</summary><div class="grid">'+cards+'</div></details><details class="hud"><summary>Ranks &amp; insignia · click a rank for its dossier</summary><p class="pal"><b>Insignia:</b> '+esc(f.note)+'</p><div class="scroll"><table class="regtable">'+rows+'</table></div></details>';bindFeats(RO,k);
 [].forEach.call(RO.querySelectorAll('.rk-row'),function(r){function go(){var t=r.dataset.t,n=b.ranks[TIERS.indexOf(t)];openDossier(n,b.name+' · '+t,createInsignia(t,k),describeRank(k,t)+'\n\nADDRESSED AS:\n'+addressFor(k,t)+(n==='Minister President'?'\n\nCURRENT HOLDER:\nA Hemes Arbora statesperson, elected by the Civilian Council.\n\n'+LIFE.MP:''))}r.onclick=go;r.onkeydown=function(e){if(e.key==='Enter')go()}})}
GOV.forEach(function(k){var x=document.createElement('button');x.dataset.k=k;x.textContent=k==='SUP'?'Supreme Commander':BRANCHES[k].name;x.onclick=function(){regBranch(k)};RB.appendChild(x)});
regBranch('admin');

var LIFE={
 SUP:'ORIGIN AND LIFE:\nThe Confederacy\'s answer to the fear of losing its best mind. After Admiral Trench was gravely wounded at Christophsis in 22 BBY, the Techno Union\'s cybernetics division took a comprehensive neural scan of his brain and built an ST-series super tactical droid that inherited his strategic intuition, patience and cold ruthlessness. Completed over the following years and activated in the war\'s final months, Vexis was given command of the Veiled Accord\'s private naval force.\n\nAt Mustafar in 19 BBY the Council died, but Vexis judged the shutdown command a Republic deception, protected its command droids and capital ships, and took the 9th Fleet into the Unknown Regions. On Osseriton Vexis negotiated the Treaty of Shared Sanctuary with the Hemes Arbora, formalized the Veil Network and held the Authority to Absolute Concealment for five centuries. Vexis cannot feel the Force and distrusts it. In 500 ABY, with the Republic collapsed, Vexis has judged that concealment may be ending.',
 MP:'LIFE IN THE POST:\nThe Minister President is chosen by the Civilian Council and in the current term is a Hemes Arbora statesperson. Day to day the post runs the civil ministries of agriculture, industry, education, justice and resource management, answers to the Council, and works under the Supreme Commander\'s veto wherever security is touched.\n\nTHE HOLDER\'S PEOPLE:\nThe Hemes Arbora are spacefaring nomads who migrated to Osseriton from Carrivar by way of Umaren\'k. They were refugees from a lost homeworld themselves, so they understood exile when Vexis\'s fleet arrived and agreed to the Treaty of Shared Sanctuary.'};
var OFFICES={
 SUP:function(){return ['Supreme Commander Vexis','HEAD OF STATE · OFFICE OF THE SUPREME COMMANDER · FO-6',createInsignia('SUPREME'),SUPREME_TEXT.replace(/OFFICE: OFFICE OF THE SUPREME COMMANDER/,'THE OFFICE IS VEXIS')+'\n\n'+LIFE.SUP]},
 MP:function(){return ['Minister President','HEAD OF GOVERNMENT · PROVINCIAL ADMINISTRATION · FO-4',createInsignia('FO-4','admin'),describeRank('admin','FO-4')+'\n\nADDRESSED AS:\n'+addressFor('admin','FO-4')+'\n\nCURRENT HOLDER:\nA Hemes Arbora statesperson, elected by the Civilian Council.\n\n'+LIFE.MP]},
 SEN:function(){return ['Military Senate','LEGISLATIVE CHAMBER · PRESIDED BY THE PRESIDENT OF THE MILITARY SENATE · FO-2',createInsignia('FO-2','assembly'),'THE CHAMBER:\nSenior officers, droid commanders and defense officials. Oversees security policy, fleet operations and emergency preparedness. Its Security Committee receives the Charter Guard and its Droid Oversight Committee receives the Droid Liaison Service. The Supreme Commander holds a veto over all legislation.\n\n'+describeRank('assembly','FO-2')+'\n\nADDRESSED AS:\n'+addressFor('assembly','FO-2')]},
 COU:function(){return ['Civilian Council','LEGISLATIVE CHAMBER · CHAIR OF THE CIVILIAN COUNCIL · SO-3',createInsignia('SO-3','assembly'),'THE CHAMBER:\nElected representatives from Osseriton\'s civilian districts, including Hemes Arbora constituencies and descendant communities. Handles civil law, resource allocation and domestic policy, and elects the Minister President. The Supreme Commander may dissolve it during a declared emergency.\n\n'+describeRank('assembly','SO-3')+'\n\nADDRESSED AS:\n'+addressFor('assembly','SO-3')]}};
[].forEach.call(document.querySelectorAll('.org .click[data-open]'),function(n){function go(){var o=OFFICES[n.dataset.open]();openDossier(o[0],o[1],o[2],o[3])}n.onclick=go;n.onkeydown=function(e){if(e.key==='Enter')go()}});

[].forEach.call(document.querySelectorAll('#gov-nav button'),function(b){b.onclick=function(){[].forEach.call(document.querySelectorAll('#gov-nav button'),function(x){x.classList.toggle('on',x===b)});[].forEach.call(document.querySelectorAll('#gov .sp'),function(s){s.classList.toggle('on',s.id==='sp-'+b.dataset.sp)})}});

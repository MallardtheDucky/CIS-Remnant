(function(){
var P=function(id){return document.getElementById(id)};
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function yl(y){return y<0?(-y)+' BBY':y+' ABY'}
var SM={a:1,an:1,and:1,the:1,of:1,in:1,on:1,to:1,for:1,at:1,by:1,from:1,with:1,or:1};
function tc(t){return t.split(' ').map(function(w,i){return i&&SM[w.toLowerCase()]?w.toLowerCase():w.charAt(0).toUpperCase()+w.slice(1)}).join(' ')}
[EVENTS,GALAXY,PEOPLE,PLACES,DOCS].forEach(function(l){l.forEach(function(r){r.title=tc(r.title)})});
var ALL=[].concat(EVENTS.map(function(e){return e}),GALAXY.map(function(g){return {id:g.id,y:g.y,yl:g.yl,tr:'g',era:null,title:g.title,short:g.t,g:g}}));
ALL.sort(function(a,b){return a.y-b.y||(a.tr==='o'?-1:1)});
var BY={};ALL.forEach(function(e){BY[e.id]=e});EVENTS.forEach(function(e){BY[e.id]=e});
function eraOf(e){if(e.era)return e.era;var y=e.y;return y<-19?'accord':y<=-19?'landfall':y<5?'conceal':y<25?'continued':y<30?'silences':y<500?'consol':'reassess'}
var ERA={};ERAS.forEach(function(e){ERA[e.id]=e});
var REC={};PEOPLE.concat(PLACES,DOCS).forEach(function(r){REC[r.id]=r});
function skey(r){return r.sk||(PEOPLE.indexOf(r)>=0?'person-':PLACES.indexOf(r)>=0?'place-':'')+r.id}
ERAS.forEach(function(e){e.sk='era-'+e.id});
var IMGS={};['mustafar','landfall','person-trench','person-vexis'].forEach(function(k){IMGS[k]=1});
var EXT=['jpg','png','webp','jpeg'],OK={};
function port(s){var im=s.querySelector('img');if(!im||s.classList.contains('sq')||s.closest('.hc'))return;function chk(){s.classList.add('fit')}if(im.complete)chk();else im.onload=chk}
var VIDS={'person-trench':1,'landfall':1},VEXT=['mp4','webm'],VOK={};
function fillH(s){var id=s.dataset.hid,l=s.dataset.label,m=(typeof MEDIA!=='undefined'&&MEDIA['hist-'+id])||{},sq=s.classList.contains('sq');
 function off(){s.classList.add('off');s.innerHTML='<span class="mono">'+esc(l)+'<br>NO '+(VIDS[id]?'VIDEO OR IMAGE':'IMAGE')+' YET</span>'}
 function on(src){OK[id]=src;s.classList.remove('off');s.innerHTML='<img src="'+src+'" alt="'+esc(l)+'">'+(sq?'':'<span class="cap mono">'+esc(l)+'</span>');port(s)}
 function vid(src){s.classList.remove('off');s.classList.add('vid');
  if(sq||!s.closest('#dbody')){s.innerHTML='<video src="'+src+'#t=0.5" muted preload="metadata" playsinline></video>';return}
  s.innerHTML='<video src="'+src+'" controls autoplay playsinline preload="auto"></video><div class="vwarn mono"><span>⚠ THIS VIDEO HAS AUDIO. CHECK YOUR VOLUME.</span></div>';
  var v=s.querySelector('video'),w=s.querySelector('.vwarn');
  function muted(){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){});var b=document.createElement('button');b.textContent='UNMUTE';b.onclick=function(){v.muted=false;b.remove()};w.appendChild(b)}
  var p=v.play();if(p&&p.catch)p.catch(muted)}
 function img(){if(m.img)return on(m.img);if(OK[id]===false)return off();if(OK[id])return on(OK[id]);
  var i=0;(function t(){if(i>=EXT.length){OK[id]=false;return off()}var src='assets/images/history/'+id+'.'+EXT[i++],im=new Image();im.onload=function(){on(src)};im.onerror=t;im.src=src})()}
 if(m.video)return vid(m.video);
 if(!VIDS[id])return img();
 if(VOK[id])return vid(VOK[id]);if(VOK[id]===false)return img();
 var j=0;(function t(){if(j>=VEXT.length){VOK[id]=false;return img()}var src='assets/videos/history/'+id+'.'+VEXT[j++],v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=function(){VOK[id]=src;vid(src)};v.onerror=t;v.src=src})()}
function fillAll(root){[].forEach.call(root.querySelectorAll('.hs'),fillH)}
function slot(id,label,cls){if(!IMGS[id])return '';return '<div class="slot hs '+(cls||'wide')+'" data-hid="'+id+'" data-label="'+esc(label)+'"></div>'}
function openRec(o){
 var ex=slot(o.id,o.title.toUpperCase()+' · IMAGE');
 if(o.gfx)ex=o.gfx+ex;
 if(o.chips&&o.chips.length)ex+='<div class="dh mono">RELATED RECORDS</div><div class="regtabs">'+o.chips.map(function(c,i){return '<button class="hgo" data-i="'+i+'">'+esc(c.l)+'</button>'}).join('')+'</div>';
 if(o.nav)ex+='<div class="hnav"><button class="hgo2" data-d="-1" '+(o.nav[0]?'':'disabled')+'>◂ '+(o.nav[0]?esc(o.nav[0].title):'')+'</button><button class="hgo2" data-d="1" '+(o.nav[1]?'':'disabled')+'>'+(o.nav[1]?esc(o.nav[1].title):'')+' ▸</button></div>';
 openDossier(o.title,o.sub,'<div class="mono hyear" style="color:'+(o.col||'#4aa8ff')+'">'+esc(o.ins)+'</div>',o.text,ex);
 var b=P('dbody');fillAll(b);
 [].forEach.call(b.querySelectorAll('.hgo'),function(x){x.onclick=function(){o.chips[+x.dataset.i].go()}});
 [].forEach.call(b.querySelectorAll('.hgo2'),function(x){x.onclick=function(){openEvent(o.nav[+x.dataset.d>0?1:0].id)}})}
function gotoTab(t,sub){P('dossier').classList.remove('show');if(t==='hist-docs'){t='hist';sub='h-docs'}
 document.querySelector('#nav [data-id="'+t+'"]').click();if(sub)document.querySelector('#hist-nav [data-sp="'+sub+'"]').click()}
function bars(rows,title){return '<div class="hbars"><div class="dh mono">'+title+'</div>'+rows.map(function(r){return '<div class="hb"><span class="mono">'+r[0]+'</span><div><i style="width:'+r[1]+'%;background:'+r[2]+'"></i></div><b class="mono">'+r[1]+'%</b></div>'}).join('')+'</div>'}
var GFX={silence1:bars([['VAULTS BEFORE',66,'#4aa8ff'],['VAULTS AFTER',46,'#ff5a4a']],'THE FIRST SILENCE · IMPORTS STOP'),silence2:bars([['VAULTS BEFORE',66,'#4aa8ff'],['VAULTS AFTER',60,'#ff9f2e']],'THE SECOND SILENCE · IMPORTS HALVE')};
function evChips(ids,kind){return (ids||[]).map(function(i){var r=kind==='e'?BY[i]:REC[i];return r&&{l:(kind==='e'?(r.yl||yl(r.y))+' · ':'')+r.title,go:function(){kind==='e'?openEvent(i):openRecord(i)}}}).filter(Boolean)}
function openEvent(id){var e=BY[id],i=ALL.indexOf(e),er=ERA[eraOf(e)],o={id:id,title:e.title,col:e.tr==='o'?'#4aa8ff':'#ff9f2e',ins:e.yl,nav:[ALL[i-1],ALL[i+1]]},ch=[];
 if(e.tr==='o'){o.sub='OSSERITON · '+er.name.toUpperCase();o.text='WHAT HAPPENED\n'+e.text+'\n\nWHY IT MATTERED\n'+e.why;o.gfx=GFX[id]||'';
  var g=GALAXY.filter(function(x){return x.y===e.y&&x.id!=='g-end'||x.y===e.y})[0];if(g)o.text+='\n\nMEANWHILE IN THE GALAXY\n'+g.title+'. '+g.t;
  (e.L||[]).forEach(function(l){ch.push({l:l[1],go:function(){gotoTab(l[0])}})});
  ch=ch.concat(evChips(e.P,'r'),evChips(e.PL,'r'))}
 else{o.sub='THE GALAXY · '+e.yl;o.text='WHAT HAPPENED\n'+e.g.t+'\n\nHOW OSSERITON READ IT\n'+e.g.r;
  var m=EVENTS.filter(function(x){return x.y===e.y})[0];if(m){o.text+='\n\nAT THE SAME TIME ON OSSERITON\n'+m.title+'. '+m.short;ch.push({l:'Osseriton: '+m.title,go:function(){openEvent(m.id)}})}}
 ch.push({l:'Era: '+er.name,go:function(){openEra(er.id)}});o.chips=ch;openRec(o)}
function openRecord(id){var r=REC[id],kind=PEOPLE.indexOf(r)>=0?'PEOPLE':PLACES.indexOf(r)>=0?'PLACES':'FOUNDING DOCUMENTS';
 openRec({id:skey(r),title:r.title,sub:kind+' · '+r.k,ins:r.k,text:r.t.replace(/^/,'')+'\n\nIN THE RECORD\n'+(r.E||[]).map(function(x){return BY[x].yl+': '+BY[x].title}).join('\n'),chips:evChips(r.E,'e')})}
function openEra(id){var e=ERA[id],ev=ALL.filter(function(x){return x.tr==='o'&&eraOf(x)===id});
 openRec({id:'era-'+id,title:e.name,sub:'ERA · '+e.span,ins:e.span,col:e.col,text:e.sum+'\n\nTHE DECISION\n'+e.decision+'\n\nEVENTS ON OSSERITON\n'+ev.map(function(x){return x.yl+': '+x.title}).join('\n'),chips:ev.map(function(x){return {l:x.yl+' · '+x.title,go:function(){openEvent(x.id)}}})})}
var filt='all';
function tlHTML(){var ribbon='<div class="eribbon">'+ERAS.map(function(e){return '<button data-e="'+e.id+'" style="flex:'+e.w+';background:'+e.col+'" title="'+esc(e.name)+'"><span>'+esc(e.name)+'</span><em class="mono">'+e.span+'</em></button>'}).join('')+'</div>';
 var chips='<div class="regtabs sub" id="tlf">'+[['all','All events'],['o','Osseriton'],['g','The galaxy']].map(function(c){return '<button data-f="'+c[0]+'" class="'+(c[0]===filt?'on':'')+'">'+c[1]+'</button>'}).join('')+'</div>';
 var h='',cur='';ALL.filter(function(e){return filt==='all'||e.tr===filt}).forEach(function(e){var er=eraOf(e);if(er!==cur){cur=er;h+='<div class="eh" id="eh-'+er+'" style="border-color:'+ERA[er].col+'"><b style="color:'+ERA[er].col+'">'+esc(ERA[er].name)+'</b><span class="mono">'+ERA[er].span+'</span></div>'}
  h+='<div class="ev '+e.tr+'" tabindex="0" role="button" data-id="'+e.id+'">'+slot(e.id,e.title.toUpperCase(),'sq')+'<div><div class="mono ey">'+e.yl+' · '+(e.tr==='o'?'OSSERITON':'THE GALAXY')+'</div><b>'+esc(e.title)+'</b><p>'+esc(e.short)+'</p></div></div>'});
 return '<p>Every event opens its own record with a description. The main ones carry an image. Blue entries are Osseriton, orange are the wider galaxy as the Veil recorded it. Click an era to jump to it.</p>'+ribbon+chips+'<div class="tlv">'+h+'</div>'}
function drawTL(){var el=P('sp-h-time');el.innerHTML=tlHTML();fillAll(el);
 [].forEach.call(el.querySelectorAll('.ev'),function(x){function go(){openEvent(x.dataset.id)}x.onclick=go;x.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
 [].forEach.call(el.querySelectorAll('#tlf button'),function(b){b.onclick=function(){filt=b.dataset.f;drawTL()}});
 [].forEach.call(el.querySelectorAll('.eribbon button'),function(b){b.onclick=function(){var t=P('eh-'+b.dataset.e);if(t)t.scrollIntoView({behavior:'smooth',block:'start'});else openEra(b.dataset.e)}})}
function cardGrid(id,list,fn,open,hero){P(id).innerHTML='<div class="grid hg">'+list.map(function(r){return '<div class="card hud hc" tabindex="0" role="button" data-id="'+r.id+'">'+(hero?slot(skey(r),r.name||r.title,'wide'):'')+'<div class="k mono">'+esc(fn.k(r))+'</div><div class="v">'+esc(fn.t(r))+'</div><p>'+esc(fn.p(r))+'</p></div>'}).join('')+'</div>';fillAll(P(id));
 [].forEach.call(P(id).querySelectorAll('.hc'),function(x){function go(){open(x.dataset.id)}x.onclick=go;x.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}})}
function first(t){var s=t.split('\n')[0];return s.length>170?s.slice(0,167).replace(/\s+\S*$/,'')+'...':s}
function erasTab(){P('sp-h-eras').innerHTML='<p>Seven chapters of the Authority\'s story. Open one for its events, and the decision that defined it.</p>';var d=document.createElement('div');d.id='eg';P('sp-h-eras').appendChild(d);
 cardGrid('eg',ERAS,{k:function(r){return r.span},t:function(r){return r.name},p:function(r){return r.sum.split('. ')[0]+'.'}},openEra,true);
 var t='<h3>The decisions of Vexis</h3><div class="scroll"><table><tr><th>ERA</th><th>THE DECISION</th></tr>'+ERAS.map(function(e){return '<tr><td><b>'+esc(e.name)+'</b><br><span class="mono" style="color:var(--dim)">'+e.span+'</span></td><td>'+esc(e.decision)+'</td></tr>'}).join('')+'</table></div>';P('sp-h-eras').insertAdjacentHTML('beforeend',t)}
function watchTab(){P('sp-h-watch').innerHTML='<p>For five centuries the Veil listened and never acted. These are the events it recorded and what the Authority took from each.</p><div class="grid hg" id="wg"></div>';
 cardGrid('wg',ALL.filter(function(e){return e.tr==='g'}),{k:function(r){return r.yl},t:function(r){return r.title},p:function(r){return r.g.r}},openEvent,false)}
var WK={'person-trench':'Trench','christophsis':'Battle of Christophsis','scan':'Trench','place-christophsis':'Christophsis','mustafar':'Mustafar','place-mustafar':'Mustafar','g-mustafar':'Order 66','person-tambor':'Wat Tambor','person-chiss':'Chiss Expansionary Defense Force','g-endor':'Battle of Endor','g-thrawn':'Thrawn','g-bilbringi':'Battle of Bilbringi','g-daala':'Natasi Daala','g-anaxes':'Battle of Anaxes','g-vong':'Yuuzhan Vong','g-coop':'Yuuzhan Vong War','g-coruscant':'Coruscant','g-vongdefeat':'Yuuzhan Vong War','g-moncala':'Mon Cala','g-moncala2':'Mon Cala','g-vorrum':'Jiira Vorrum','place-carrivar':'Carrivar'};
drawTL();erasTab();
cardGrid('sp-h-people',PEOPLE,{k:function(r){return r.k},t:function(r){return r.title},p:function(r){return first(r.t)}},openRecord,true);
cardGrid('sp-h-places',PLACES,{k:function(r){return r.k},t:function(r){return r.title},p:function(r){return first(r.t)}},openRecord,true);
cardGrid('sp-h-docs',DOCS,{k:function(r){return r.k},t:function(r){return r.title},p:function(r){return first(r.t)}},openRecord,false);
watchTab();
[].forEach.call(document.querySelectorAll('.slot:not(.hs) img'),function(im){var s=im.parentNode;port(s)});
var OVMAP=['christophsis','accord','mustafar','treaty','concealment','protocol','silence1','covenant','silence2','consolidation','final'];
[].forEach.call(document.querySelectorAll('#sp-h-over .tl>div'),function(d,i){var id=OVMAP[i];if(!id)return;d.style.cursor='pointer';d.tabIndex=0;d.setAttribute('role','button');function go(){openEvent(id)}d.onclick=go;d.onkeydown=function(e){if(e.key==='Enter'){go()}}});
[].forEach.call(document.querySelectorAll('#hist-nav button'),function(b){b.onclick=function(){[].forEach.call(document.querySelectorAll('#hist-nav button'),function(x){x.classList.toggle('on',x===b)});[].forEach.call(document.querySelectorAll('#hist .sp'),function(s){s.classList.toggle('on',s.id==='sp-'+b.dataset.sp)})}});
})();

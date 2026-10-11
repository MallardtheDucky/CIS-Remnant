var T=[["overview","OVERVIEW"],["gov","GOVERNMENT"],["eco","ECONOMY"],["hist","HISTORY"],["veil","VEIL NETWORK"],["vigil","BROTHERHOOD ⚠"]];
var nav=document.getElementById('nav');
function show(id){T.forEach(function(t){document.getElementById(t[0]).classList.toggle('on',t[0]===id)});
[].forEach.call(nav.children,function(b){b.classList.toggle('on',b.dataset.id===id)});var mn=document.querySelector('main');if(mn)mn.scrollTop=0;window.scrollTo(0,0);try{history.replaceState(null,'','#'+id)}catch(e){}}
T.forEach(function(t){var b=document.createElement('button');b.textContent=t[1];b.dataset.id=t[0];if(t[0]==='vigil')b.className='cls';b.onclick=function(){show(t[0])};nav.appendChild(b)});
var h=location.hash.slice(1);show(T.some(function(t){return t[0]===h})?h:'overview');
[].forEach.call(document.querySelectorAll('[data-go]'),function(c){function go(){show(c.dataset.go)}c.onclick=go;c.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});var SEXT=['jpg','jpeg','png','webp'];
[].forEach.call(document.querySelectorAll('.slot[data-slot]'),function(s){var m=MEDIA[s.dataset.slot]||{},l=s.dataset.label,sq=s.classList.contains('sq');
 function put(src){s.style.display='';s.classList.remove('off');s.innerHTML='<img src="'+src+'" alt="'+l+'"><span class="cap mono">'+l+'</span>';if(!sq)s.classList.add('fit');var sv=s.parentNode.querySelector(':scope > svg');if(sv)sv.style.display='none'}
 function off(){s.style.display='';s.classList.add('off');s.innerHTML='<span class="mono">'+l+'<br>FEED OFFLINE</span>'}
 if(m.img)return put(m.img);
 s.style.display='none';
 var i=0;(function t(){if(i>=SEXT.length)return off();var src='assets/images/'+s.dataset.slot+'.'+SEXT[i++],im=new Image();im.onload=function(){put(src)};im.onerror=t;im.src=src})()});
var boot=document.getElementById('boot'),L=["> CONFEDERATE PROVINCIAL AUTHORITY // COMMAND TERMINAL","> AUTHENTICATING AGAINST VEXIS CORE ... <em>OK</em>","> SENSOR MASK .......... ACTIVE","> OFF-WORLD UPLINK ..... <em>SEVERED</em>","> WELCOME, OFFICER."],i2=0;
if(matchMedia('(prefers-reduced-motion:reduce)').matches){boot.remove()}else{(function n(){if(i2<L.length){boot.innerHTML+=L[i2++]+"<br>";setTimeout(n,300)}else{boot.style.opacity=0;setTimeout(function(){boot.remove()},700)}})()}

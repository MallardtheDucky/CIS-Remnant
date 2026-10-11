var T=[["overview","OVERVIEW"],["gov","GOVERNMENT"],["eco","ECONOMY"],["hist","HISTORY"],["veil","VEIL NETWORK"],["vigil","BROTHERHOOD ⚠"]];
var nav=document.getElementById('nav');
function show(id){T.forEach(function(t){document.getElementById(t[0]).classList.toggle('on',t[0]===id)});
[].forEach.call(nav.children,function(b){b.classList.toggle('on',b.dataset.id===id)});var mn=document.querySelector('main');if(mn)mn.scrollTop=0;window.scrollTo(0,0);try{history.replaceState(null,'','#'+id)}catch(e){}}
T.forEach(function(t){var b=document.createElement('button');b.textContent=t[1];b.dataset.id=t[0];if(t[0]==='vigil')b.className='cls';b.onclick=function(){show(t[0])};nav.appendChild(b)});
var h=location.hash.slice(1);show(T.some(function(t){return t[0]===h})?h:'overview');
[].forEach.call(document.querySelectorAll('[data-go]'),function(c){function go(){show(c.dataset.go)}c.onclick=go;c.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});var needMV=false;
[].forEach.call(document.querySelectorAll('.slot'),function(s){var m=MEDIA[s.dataset.slot]||{},l=s.dataset.label;
 if(m.img){s.innerHTML='<img src="'+m.img+'" alt="'+l+'"><span class="cap mono">'+l+'</span>';var sv=s.parentNode.querySelector(':scope > svg');if(sv)sv.style.display='none'}
 else if(m.model){needMV=true;s.innerHTML='<model-viewer src="'+m.model+'" '+(m.poster?'poster="'+m.poster+'" ':'')+'camera-controls auto-rotate shadow-intensity="0" alt="'+l+'"></model-viewer><span class="cap mono">'+l+' · DRAG TO ROTATE</span>'}
 else{s.classList.add('off');s.innerHTML='<span class="mono">'+l+'<br>FEED OFFLINE</span>'}});
if(needMV){var sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer-umd.min.js';document.head.appendChild(sc)}
var boot=document.getElementById('boot'),L=["> CONFEDERATE PROVINCIAL AUTHORITY // COMMAND TERMINAL","> AUTHENTICATING AGAINST VEXIS CORE ... <em>OK</em>","> SENSOR MASK .......... ACTIVE","> OFF-WORLD UPLINK ..... <em>SEVERED</em>","> WELCOME, OFFICER."],i2=0;
if(matchMedia('(prefers-reduced-motion:reduce)').matches){boot.remove()}else{(function n(){if(i2<L.length){boot.innerHTML+=L[i2++]+"<br>";setTimeout(n,300)}else{boot.style.opacity=0;setTimeout(function(){boot.remove()},700)}})()}

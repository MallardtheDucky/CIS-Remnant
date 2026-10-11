const VIGIL_RANKS=[
 ['FO-5','Magister','Sole head of the Order and keeper of the Covenant. Answers to the Supreme Commander alone and to no one inside the Order.','1'],
 ['FO-4','Marshal','One of the Magister\'s two hands. The Order\'s field arm. A senior voice in the Chapter. Always an Edge-brother.','1'],
 ['LATERAL','Seneschal','The other hand: discipline, oaths, records and the Vaults. Stands beside the Marshal, not above or below.','1'],
 ['SO-3','Preceptor','Teaching rank and regional head. Runs a Vigil Hall and sits on the Chapter.','2–3'],
 ['SO-1','Prior','First command rank. Leads a field cell of two to four Sworn and answers for their deaths.','3–5'],
 ['JO-2','Sworn','The working heart of the Order. A full operative on writ with a droid Counsel. May take a Calling.','10–15'],
 ['MID-1','Novice','Sworn trainee bonded to one mentor. First oath taken. About a decade of training.','5–12'],
 ['E-2','Aspirant','Adult candidate on trial, tested for temperament, loyalty, Force aptitude and tolerance for pain and boredom.','—'],
 ['E-1','Oblate','The lowest rung and the only one not sworn. A child ward of the Order.','—']];
document.getElementById('ranks').innerHTML=VIGIL_RANKS.map(function(r){
 return '<div class="rk"><div class="ins">'+createInsignia(r[0],'vigil')+'</div><div><div class="rn">'+r[1]+'</div><div class="mono rt">'+(r[0]==='LATERAL'?'FO-4 · LATERAL':r[0])+' · BROTHERS: '+r[3]+'</div><p>'+r[2]+'</p></div></div>'}).join('');

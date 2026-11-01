/* Vero Cosmos: panel "Estado de la Luna" (Guia astronomica).
   Calcula fase, edad, salida y puesta de la Luna para la ubicacion del visitante y las proximas fases.
   La ubicacion se guarda en localStorage("vc-loc"), la misma que usan las fichas. */
(function(){
'use strict';
const RAD=Math.PI/180;
const CITIES=[['Madrid',40.42,-3.70,'Europe/Madrid'],['Sevilla',37.39,-5.98,'Europe/Madrid'],['Las Palmas',28.12,-15.43,'Atlantic/Canary'],['Lisboa',38.72,-9.14,'Europe/Lisbon'],['París',48.86,2.35,'Europe/Paris'],['Londres',51.51,-0.13,'Europe/London'],['Berlín',52.52,13.40,'Europe/Berlin'],['Roma',41.90,12.50,'Europe/Rome'],['Ciudad de México',19.43,-99.13,'America/Mexico_City'],['Bogotá',4.71,-74.07,'America/Bogota'],['Lima',-12.05,-77.04,'America/Lima'],['Quito',-0.18,-78.47,'America/Guayaquil'],['Caracas',10.48,-66.90,'America/Caracas'],['Santiago de Chile',-33.45,-70.67,'America/Santiago'],['Buenos Aires',-34.60,-58.38,'America/Argentina/Buenos_Aires'],['Montevideo',-34.90,-56.19,'America/Montevideo'],['Asunción',-25.26,-57.58,'America/Asuncion'],['La Paz',-16.50,-68.15,'America/La_Paz'],['San José',9.93,-84.08,'America/Costa_Rica'],['Ciudad de Panamá',8.98,-79.52,'America/Panama'],['Ciudad de Guatemala',14.63,-90.51,'America/Guatemala'],['La Habana',23.11,-82.37,'America/Havana'],['Santo Domingo',18.49,-69.93,'America/Santo_Domingo'],['San Juan',18.47,-66.11,'America/Puerto_Rico'],['Nueva York',40.71,-74.01,'America/New_York'],['Los Ángeles',34.05,-118.24,'America/Los_Angeles'],['Manila',14.60,120.98,'Asia/Manila']];
const STR={
  title:{es:'Estado de la Luna',en:'Moon status',fr:'État de la Lune'},
  today:{es:'Hoy',en:'Today',fr:'Aujourd’hui'},
  tomorrow:{es:'Mañana',en:'Tomorrow',fr:'Demain'},
  lit:{es:'iluminada',en:'illuminated',fr:'éclairée'},
  age:{es:'Edad',en:'Age',fr:'Âge'},
  days:{es:'días',en:'days',fr:'jours'},
  rise:{es:'Sale',en:'Moonrise',fr:'Lever'},
  set:{es:'Se pone',en:'Moonset',fr:'Coucher'},
  next:{es:'Próximos días',en:'Coming days',fr:'Jours suivants'},
  events:{es:'Próximas fases',en:'Next phases',fr:'Prochaines phases'},
  calc:{es:'Calculado para',en:'Calculated for',fr:'Calculé pour'},
  change:{es:'Cambiar',en:'Change',fr:'Modifier'},
  geo:{es:'Usar mi ubicación',en:'Use my location',fr:'Utiliser ma position'},
  search:{es:'Busca tu municipio…',en:'Search your town…',fr:'Cherchez votre commune…'},
  none:{es:'No hay coincidencias.',en:'No matches found.',fr:'Aucun résultat.'},
  finding:{es:'Buscando tu ubicación…',en:'Finding your location…',fr:'Recherche de votre position…'},
  fail:{es:'No se pudo obtener tu ubicación. Busca tu municipio.',en:'Could not get your location. Search your town.',fr:'Impossible d’obtenir votre position. Cherchez votre commune.'},
  tz:{es:'según tu zona horaria',en:'based on your time zone',fr:'d’après votre fuseau horaire'},
  yourloc:{es:'Tu ubicación',en:'Your location',fr:'Votre position'},
  nextday:{es:'(día siguiente)',en:'(next day)',fr:'(le lendemain)'},
  ph:[{es:'Luna nueva',en:'New Moon',fr:'Nouvelle lune'},{es:'Luna creciente',en:'Waxing crescent',fr:'Premier croissant'},{es:'Cuarto creciente',en:'First quarter',fr:'Premier quartier'},{es:'Gibosa creciente',en:'Waxing gibbous',fr:'Gibbeuse croissante'},{es:'Luna llena',en:'Full Moon',fr:'Pleine lune'},{es:'Gibosa menguante',en:'Waning gibbous',fr:'Gibbeuse décroissante'},{es:'Cuarto menguante',en:'Last quarter',fr:'Dernier quartier'},{es:'Luna menguante',en:'Waning crescent',fr:'Dernier croissant'}],
  ev:{0:{es:'Luna nueva',en:'New Moon',fr:'Nouvelle lune'},90:{es:'Cuarto creciente',en:'First quarter',fr:'Premier quartier'},180:{es:'Luna llena',en:'Full Moon',fr:'Pleine lune'},270:{es:'Cuarto menguante',en:'Last quarter',fr:'Dernier quartier'}}
};
const lang=()=>window.vcI18n?vcI18n.lang:'es';
const S=k=>STR[k][lang()]||STR[k].es;
const LOCALE={es:'es-ES',en:'en-GB',fr:'fr-FR'};
const T=n=>window.vcI18n?vcI18n.t(n):n;

/* ---------- astronomia sencilla ---------- */
const jd=ms=>ms/86400000+2440587.5,Tc=t=>(jd(t)-2451545)/36525;
function eclToEq(lon,lat,T0){const e=(23.439291-.0130042*T0)*RAD,l=lon*RAD,b=lat*RAD,x=Math.cos(b)*Math.cos(l),y=Math.cos(b)*Math.sin(l)*Math.cos(e)-Math.sin(b)*Math.sin(e),z=Math.cos(b)*Math.sin(l)*Math.sin(e)+Math.sin(b)*Math.cos(e);return{ra:((Math.atan2(y,x)/RAD)+360)%360,dec:Math.asin(z)/RAD}}
function sunLon(t){const n=jd(t)-2451545,L0=280.460+.9856474*n,g=(357.528+.9856003*n)*RAD;return((L0+1.915*Math.sin(g)+.02*Math.sin(2*g))%360+360)%360}
function moonPos(t){
  const T0=Tc(t),d=x=>x*RAD,Lp=218.3164477+481267.88123421*T0,D=297.8501921+445267.1114034*T0,M=357.5291092+35999.0502909*T0,Mp=134.9633964+477198.8675055*T0,F=93.272095+483202.0175233*T0;
  const lon=((Lp+6.289*Math.sin(d(Mp))+1.274*Math.sin(d(2*D-Mp))+.658*Math.sin(d(2*D))+.214*Math.sin(d(2*Mp))-.186*Math.sin(d(M))-.114*Math.sin(d(2*F)))%360+360)%360;
  const lat=5.128*Math.sin(d(F))+.281*Math.sin(d(Mp+F))+.278*Math.sin(d(Mp-F))+.173*Math.sin(d(2*D-F));
  return{lon,...eclToEq(lon,lat,T0)};
}
const elong=t=>(((moonPos(t).lon-sunLon(t))%360)+360)%360;
const illumOf=el=>(1-Math.cos(el*RAD))/2;
function alt(ra,dec,t,lat,lon){const gm=(280.46061837+360.98564736629*(jd(t)-2451545))%360,ha=(gm+lon-ra)*RAD;return Math.asin(Math.sin(lat*RAD)*Math.sin(dec*RAD)+Math.cos(lat*RAD)*Math.cos(dec*RAD)*Math.cos(ha))/RAD}
function tzOff(ms,tz){try{const p=new Intl.DateTimeFormat('en-GB',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date(ms)).reduce((o,x)=>(o[x.type]=x.value,o),{});return(Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute)-Math.floor(ms/60000)*60000)/60000}catch(e){return 60}}
/* inicio del dia local (en ms UTC) para el dia que contiene "ms", desplazado n dias */
function dayStart(ms,tz,n){
  const o=tzOff(ms,tz),d=new Date(ms+o*60000),base=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+n);
  return base-tzOff(base,tz)*60000;
}
/* salida y puesta de la Luna dentro de un dia local (altura umbral +0,125 grados: refraccion, semidiametro y paralaje) */
function riseSet(start,lat,lon){
  let rise=null,set=null,prev=null;
  for(let m=0;m<=1440;m+=6){
    const t=start+m*60000,p=moonPos(t),h=alt(p.ra,p.dec,t,lat,lon)-.125;
    if(prev!==null){
      if(prev<0&&h>=0&&rise===null)rise=t-(6*60000)*h/(h-prev);
      if(prev>=0&&h<0&&set===null)set=t-(6*60000)*h/(h-prev);
    }
    prev=h;
  }
  return{rise,set};
}
/* instante en que la elongacion cruza un valor (0, 90, 180, 270) a partir de t0 */
function findCross(target,t0){
  const diff=t=>(((elong(t)-target+540)%360)-180);
  let a=t0,da=diff(a);
  for(let i=1;i<=24*36;i++){
    const b=t0+i*3600000,db=diff(b);
    if(da<0&&db>=0&&Math.abs(db-da)<90){let lo=a,hi=b;for(let k=0;k<22;k++){const mid=(lo+hi)/2;if(diff(mid)<0)lo=mid;else hi=mid}return(lo+hi)/2}
    a=b;da=db;
  }
  return null;
}
function phaseIdx(el){const f=illumOf(el),wax=el<180;return f<.05?0:f>.95?4:f<.45?(wax?1:7):f<=.55?(wax?2:6):(wax?3:5)}
let UID=0;
/* Luna con tono amarillo y trazo de dibujo (art=true: borde irregular tipo lapiz y brillo suave) */
function moonSvg(el,size,art){
  const f=illumOf(el),waxing=el<180,rx=(6*Math.abs(1-2*f)).toFixed(2),sw=f>.5?1:0,id='m'+(++UID);
  const lit='M6 0A6 6 0 0 1 6 12A'+rx+' 6 0 0 '+sw+' 6 0Z',tr=waxing?'':' transform="translate(12 0) scale(-1 1)"';
  const cr='<circle cx="4" cy="4.2" r="1.15"/><circle cx="7.7" cy="3.1" r=".7"/><circle cx="7.1" cy="7.7" r="1.45"/><circle cx="3.5" cy="8.1" r=".6"/><circle cx="9.1" cy="6" r=".5"/><circle cx="5.6" cy="2" r=".4"/>';
  return '<svg viewBox="-.6 -.6 13.2 13.2" width="'+size+'" height="'+size+'" aria-hidden="true"><defs><radialGradient id="g'+id+'" cx=".4" cy=".36" r=".78"><stop offset="0" stop-color="#fff8cf"/><stop offset=".55" stop-color="#f8d874"/><stop offset="1" stop-color="#e8a93a"/></radialGradient><clipPath id="c'+id+'"><path d="'+lit+'"'+tr+'/></clipPath></defs>'
    +(art?'<circle cx="6" cy="6" r="6.4" fill="#f6c85f" opacity=".13"/>':'')
    +'<g'+(art?' filter="url(#mn-sketch)"':'')+'><circle cx="6" cy="6" r="5.6" fill="#1a2145"/><g fill="#34407a" opacity=".55">'+cr+'</g>'
    +'<g clip-path="url(#c'+id+')"><circle cx="6" cy="6" r="5.9" fill="url(#g'+id+')"/><g fill="#c98f2a" opacity=".3">'+cr+'</g></g>'
    +'<circle cx="6" cy="6" r="5.6" fill="none" stroke="#e9b94d" stroke-width=".32"/>'
    +(art?'<circle cx="6.05" cy="5.95" r="5.42" fill="none" stroke="#f6d27a" stroke-width=".16" stroke-dasharray="3.1 .7 1.4 .5" opacity=".75"/><path d="M2.1 3.2Q3.2 1.8 4.7 1.3" fill="none" stroke="#fff3b8" stroke-width=".22" stroke-linecap="round" opacity=".6"/>':'')
    +'</g></svg>';
}
const SKETCH='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="mn-sketch" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale=".38"/></filter></svg>';

/* ---------- ubicacion ---------- */
const browserTz=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){return ''}};
function guessLoc(){
  const tz=browserTz();let c=CITIES.find(x=>x[3]===tz);
  if(!c&&tz){const o=tzOff(Date.now(),tz);c=CITIES.find(x=>tzOff(Date.now(),x[3])===o)}
  if(!c)c=CITIES[0];
  return{name:c[0],lat:c[1],lon:c[2],tz:tz||c[3],src:'tz'};
}
function loadLoc(){try{const s=JSON.parse(localStorage.getItem('vc-loc')||'null');if(s&&isFinite(s.lat)&&isFinite(s.lon)&&s.tz)return s}catch(e){}return guessLoc()}
function saveLoc(o){try{localStorage.setItem('vc-loc',JSON.stringify(o))}catch(e){}}
const fmtLat=l=>{const a=Math.abs(l).toFixed(2),s=lang()==='en'?a:a.replace('.',',');return s+'° '+(l>=0?'N':'S')};
const nrm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[-_.,']/g,' ').replace(/\s+/g,' ').trim();
let MUN=null;
async function loadMun(){
  if(MUN)return MUN;
  let d={p:[],m:[],c:[]};try{d=await(await fetch('municipios-espana.json?v=5')).json()}catch(e){}
  const CAN=new Set(['Las Palmas','Santa Cruz de Tenerife']);
  MUN=d.m.map(x=>{const pr=d.p[x[1]]||'';return{n:x[0],sub:pr,lat:x[2],lon:x[3],tz:CAN.has(pr)?'Atlantic/Canary':'Europe/Madrid',label:x[0]===pr?x[0]:x[0]+', '+pr,k:nrm(x[0]),hay:nrm(x[0]+' '+pr+' '+(x[4]||''))}})
    .concat((d.c||[]).map(c=>({n:c[0],sub:c[1],lat:c[2],lon:c[3],tz:c[4],label:c[0],k:nrm(c[0]),hay:nrm(c[0]+' '+c[1])})));
  return MUN;
}
const hav=(a,b,c,d)=>{const r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 12742*Math.asin(Math.sqrt(x))};

/* ---------- panel ---------- */
const CSS=`
.mn-h{margin:18px 0 8px;padding:0 2px;font:400 18px/1.2 "Iowan Old Style",Georgia,serif;color:#f5f7ff}
.mn-card{border:1px solid #343d63;border-radius:13px;background:linear-gradient(120deg,#111a35d9,#0b1025d9);padding:9px 11px;margin:0 0 4px}
.mn-now{display:flex;align-items:center;gap:10px}
.mn-hero{border-color:#6d5a2e;background:radial-gradient(ellipse at 20% 0%,#2c2410cc,#0b1025d9 65%)}
.mn-now svg.mn-big{flex:none;width:56px;height:56px;filter:drop-shadow(0 0 8px #f2c14e66)}
.mn-ph{color:#fff1c2}
.mn-ph{font:400 15px/1.15 "Iowan Old Style",Georgia,serif;color:#f5f7ff}
.mn-sm{color:#8f98c0;font-size:11px;margin-top:2px}
.mn-times{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
.mn-times div{padding:4px 8px;white-space:nowrap;border:1px solid #2a3258;border-radius:9px;background:#0b1025;font-size:12px;color:#8f98c0}
.mn-times b{font-size:14px;color:#eef1ff;font-weight:600}
.mn-times b small{font-size:10.5px;color:#8f98c0;font-weight:400}
.mn-sub{margin:6px 0 3px;font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:#8ab4ff;font-weight:700}
.mn-row{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid #232846;font-size:12.5px}
.mn-row:last-child{border:0}
.mn-days{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
.mn-day{display:flex;flex-direction:column;align-items:center;gap:0;padding:3px 2px;border:1px solid #232846;border-radius:9px;background:#0b102580;text-align:center}
.mn-day svg{width:24px;height:24px}
.mn-day .d{color:#eef1ff;font-size:10.5px;white-space:nowrap}
.mn-day .t{color:#c9d1f2;font-size:10px;line-height:1.25;font-variant-numeric:tabular-nums;white-space:nowrap}
.mn-row .d{color:#eef1ff}.mn-row .d small{display:block;color:#8f98c0;font-size:11.5px}
.mn-row .t{color:#c9d1f2;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;font-size:12px}
.mn-ev{display:flex;justify-content:space-between;gap:6px;padding:2px 0;font-size:11px;color:#c9d1f2}
.mn-ev span:last-child{color:#8f98c0;text-align:right}
.mn-loc{position:relative;margin-top:4px;font-size:10.5px;line-height:1.3;color:#8f98c0}
.mn-loc button.lk{border:0;background:none;color:#8ab4ff;font:inherit;text-decoration:underline;cursor:pointer;padding:0 3px}
.mn-pop{position:absolute;left:0;right:0;bottom:24px;z-index:8;padding:10px;border:1px solid #232846;border-radius:10px;background:#0b0e1ff5;box-shadow:0 12px 30px #0008;color:#eef1ff}
.mn-pop[hidden]{display:none}
.mn-pop button.geo{width:100%;padding:8px;border:1px solid #343b60;border-radius:8px;background:#151a32;color:#eef1ff;font:inherit;cursor:pointer}
.mn-pop button.geo:hover{border-color:#8ab4ff}
.mn-pop input{display:block;width:100%;margin-top:8px;padding:8px 10px;border:1px solid #343b60;border-radius:8px;background:#0e1226;color:#eef1ff;font:inherit;outline:none}
.mn-pop input:focus{border-color:#8ab4ff}
.mn-res{max-height:170px;overflow:auto;margin-top:4px}
@media(max-width:700px){.mn-card{padding:12px 14px}.mn-now svg.mn-big{width:68px;height:68px}.mn-ph{font-size:18px}.mn-sm{font-size:12.5px}.mn-times div{padding:7px 10px;font-size:13px}.mn-times b{font-size:16px}.mn-sub{font-size:11px;margin:12px 0 6px}.mn-days{gap:8px}.mn-day{padding:7px 2px;gap:2px}.mn-day svg{width:30px;height:30px}.mn-day .d{font-size:12.5px}.mn-day .t{font-size:12px}.mn-ev{font-size:13px;padding:4px 0}.mn-loc{font-size:12px;margin-top:10px}}
.f1 .mn-days{grid-template-columns:repeat(6,minmax(0,1fr));gap:3px}.f1 .mn-day{padding:3px 0}.f1 .mn-day svg{width:20px;height:20px}.f1 .mn-day .d,.f1 .mn-day .t{font-size:9.5px}
.f2 .mn-ev:nth-child(n+3){display:none}
.f3 .mn-s-ev,.f3 #mn-ev{display:none}
.f4 .mn-s-d,.f4 .mn-days{display:none}
.f5 .mn-sm{display:none}
.mn-res button{display:block;width:100%;padding:7px 9px;border:0;border-bottom:1px solid #232846;background:#10163a;color:#eef1ff;font:inherit;font-size:12.5px;text-align:left;cursor:pointer}
.mn-res button small{color:#8f98c0;margin-left:6px}
.mn-res button:hover{background:#1a2040}
.mn-res .none,.mn-pop .msg{padding:6px 8px;font-size:12px;color:#8f98c0}
`;
function mount(host){
  if(!document.getElementById('mn-css')){const st=document.createElement('style');st.id='mn-css';st.textContent=CSS;document.head.append(st)}
  const root=document.createElement('div');root.id='moon-sec';host.append(root);
  let LOC=loadLoc(),open=false;
  const fmtTime=(t,tz)=>t==null?'—':new Intl.DateTimeFormat(LOCALE[lang()],{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:tz}).format(new Date(t));
  const fmtDay=(t,tz)=>new Intl.DateTimeFormat(LOCALE[lang()],{weekday:'short',day:'numeric',month:'short',timeZone:tz}).format(new Date(t));
  const fmtDayS=(t,tz)=>new Intl.DateTimeFormat(LOCALE[lang()],{weekday:'short',day:'numeric',timeZone:tz}).format(new Date(t));
  const fmtEv=(t,tz)=>new Intl.DateTimeFormat(LOCALE[lang()],{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:tz}).format(new Date(t));
  /* se adapta al alto disponible: va quitando lo menos importante hasta que no haga falta scroll */
  let fitting=false;
  function fit(){
    if(fitting||open)return;fitting=true;
    try{
      let n=0;root.className='';
      while(n<5&&host.scrollHeight>host.clientHeight+1){n++;root.className=Array.from({length:n},(_,i)=>'f'+(i+1)).join(' ')}
    }finally{fitting=false}
  }
  try{new ResizeObserver(fit).observe(host)}catch(e){window.addEventListener('resize',fit)}
  function render(){
    const now=Date.now(),tz=LOC.tz,el=elong(now),f=illumOf(el),idx=phaseIdx(el);
    const day0=dayStart(now,tz,0),rs0=riseSet(day0,LOC.lat,LOC.lon),rsN=(rs0.rise==null||rs0.set==null)?riseSet(dayStart(now,tz,1),LOC.lat,LOC.lon):null;
    const ageD=(el/360*29.53).toFixed(1);
    let h=SKETCH+'<div class="mn-card mn-hero"><div class="mn-now">'+moonSvg(el,56,true).replace('<svg ','<svg class="mn-big" ')+'<div><div class="mn-ph">'+STR.ph[idx][lang()]+'</div><div class="mn-sm">'+Math.round(f*100)+' % '+S('lit')+' · '+S('age')+' '+(lang()==='en'?ageD:ageD.replace('.',','))+' '+S('days')+'</div></div></div>';
    const tm=(v,vn)=>v!=null?fmtTime(v,tz):(vn!=null?fmtTime(vn,tz)+' <small>'+S('nextday')+'</small>':'—');
    h+='<div class="mn-times"><div>'+S('rise')+' <b>'+tm(rs0.rise,rsN&&rsN.rise)+'</b></div><div>'+S('set')+' <b>'+tm(rs0.set,rsN&&rsN.set)+'</b></div></div></div>';
    h+='<div class="mn-sub mn-s-d">'+S('next')+'</div><div class="mn-days">';
    for(let i=1;i<=6;i++){
      const ds=dayStart(now,tz,i),noon=ds+12*3600000,ele=elong(noon),rs=riseSet(ds,LOC.lat,LOC.lon);
      h+='<div class="mn-day">'+moonSvg(ele,24)+'<div class="d">'+fmtDayS(noon,tz)+'</div><div class="t">↑'+fmtTime(rs.rise,tz)+'<br>↓'+fmtTime(rs.set,tz)+'</div></div>';
    }
    h+='</div>';
    h+='<div class="mn-sub mn-s-ev">'+S('events')+'</div><div id="mn-ev"></div>';
    h+='<div class="mn-loc">'+S('calc')+' '+T(LOC.name)+' ('+fmtLat(LOC.lat)+')'+(LOC.src==='tz'?' · '+S('tz'):'')+' <button type="button" class="lk" id="mn-ch">'+S('change')+'</button><div class="mn-pop" id="mn-pop" hidden><button type="button" class="geo" id="mn-geo">'+S('geo')+'</button><input type="search" id="mn-q" placeholder="'+S('search')+'" autocomplete="off" autocapitalize="none" spellcheck="false"><div class="mn-res" id="mn-res"></div><div class="msg" id="mn-msg"></div></div></div>';
    root.innerHTML=h;fit();
    /* proximas fases (a minuto), calculadas despues para no retrasar el pintado */
    setTimeout(()=>{
      const evs=[0,90,180,270].map(a=>({a,t:findCross(a,now)})).filter(x=>x.t).sort((x,y)=>x.t-y.t);
      const box=document.getElementById('mn-ev');if(!box)return;
      box.innerHTML=evs.map(e=>'<div class="mn-ev"><span>'+STR.ev[e.a][lang()]+'</span><span>'+fmtEv(e.t,tz)+'</span></div>').join('');
      fit();
    },30);
    wire();
  }
  function wire(){
    const pop=document.getElementById('mn-pop'),q=document.getElementById('mn-q'),box=document.getElementById('mn-res'),msg=document.getElementById('mn-msg');
    if(!pop)return;
    pop.hidden=!open;
    document.getElementById('mn-ch').onclick=()=>{open=!open;pop.hidden=!open;if(open){msg.textContent='';loadMun();setTimeout(()=>{try{q.focus()}catch(e){}},50)}};
    const pick=x=>{LOC={name:x.label,lat:x.lat,lon:x.lon,tz:x.tz,src:'city'};saveLoc(LOC);open=false;render()};
    let hits=[];
    async function search(){
      const qn=nrm(q.value);box.replaceChildren();hits=[];if(!qn)return;
      const all=await loadMun(),words=qn.split(' ');
      hits=all.filter(x=>words.every(w=>x.hay.includes(w))).map(x=>[x.k===qn?0:x.k.startsWith(qn)?1:x.k.includes(qn)?2:3,x]).sort((a,b)=>(a[0]-b[0])||a[1].n.localeCompare(b[1].n,'es')).slice(0,6).map(r=>r[1]);
      if(!hits.length){const d=document.createElement('div');d.className='none';d.textContent=S('none');box.append(d);return}
      for(const x of hits){const b=document.createElement('button');b.type='button';b.append(x.n);const s=document.createElement('small');s.textContent=T(x.sub);b.append(s);b.onclick=()=>pick(x);box.append(b)}
    }
    q.oninput=search;
    q.onkeydown=e=>{if(e.key==='Enter'&&hits[0]){e.preventDefault();pick(hits[0])}if(e.key==='Escape'){open=false;pop.hidden=true;e.stopPropagation()}};
    document.getElementById('mn-geo').onclick=()=>{
      if(!navigator.geolocation){msg.textContent=S('fail');return}
      msg.textContent=S('finding');
      navigator.geolocation.getCurrentPosition(async p=>{
        const la=p.coords.latitude,lo=p.coords.longitude,all=await loadMun();let best=null,bd=1e9;
        for(const x of all){const d=hav(la,lo,x.lat,x.lon);if(d<bd){bd=d;best=x}}
        LOC=best&&bd<=150?{name:best.label,lat:best.lat,lon:best.lon,tz:best.tz,src:'gps'}:{name:'Tu ubicación',lat:+la.toFixed(3),lon:+lo.toFixed(3),tz:browserTz()||LOC.tz,src:'gps'};
        saveLoc(LOC);open=false;render();
      },()=>{msg.textContent=S('fail')},{timeout:12000,maximumAge:3600000});
    };
  }
  render();
  window.addEventListener('vc-lang',render);
  /* se refresca cada minuto por si cambia el dia o la fase */
  setInterval(()=>{if(!open&&document.body.contains(root))render()},60000);
}
window.vcMoon={mount,_test:{moonPos,elong,riseSet,dayStart,findCross,phaseIdx}};
})();

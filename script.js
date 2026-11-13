
const $=id=>document.getElementById(id);
const mass=$('mass'),height=$('height'),gravity=$('gravity'),progress=$('progress');
let elapsed=0,running=false,lastStamp=null,raf=null,history=[],finished=false;
const fmt=n=>Number(n).toFixed(2);
function params(){return {m:+mass.value,H:+height.value,g:+gravity.value}}
function values(t){const {m,H,g}=params(),fall=Math.min(H,.5*g*t*t),v=Math.sqrt(Math.max(0,2*g*fall)),h=H-fall,ep=m*g*h,ec=.5*m*v*v;return {m,H,g,fall,v,h,ep,ec,em:ep+ec,t:Math.min(t,Math.sqrt(2*H/g))}}
function updateLabels(){ $('massOut').textContent=fmt(mass.value)+' kg';$('heightOut').textContent=height.value+' m';$('gravityOut').textContent=fmt(gravity.value)+' m/s²';$('heightLabel').textContent=height.value+' m';$('progressOut').textContent=progress.value+'%';}
function render(){
 const p=params(),v=values(elapsed),total=Math.sqrt(2*p.H/p.g),progress=Math.min(1,v.fall/p.H);
 $('ball').setAttribute('cy',35+progress*220);$('progress').value=Math.round(progress*100);$('progressOut').textContent=Math.round(progress*100)+'%';$('shadow').setAttribute('opacity',.12+progress*.45);
 $('velocity').textContent=fmt(v.v)+' m/s';$('time').textContent=fmt(v.t)+' s';$('timeRead').textContent='Tiempo: '+fmt(v.t)+' s';$('distance').textContent=fmt(v.fall)+' m';$('mechanical').textContent=fmt(p.m*p.g*p.H)+' J';
 $('state').textContent=finished?'Estado: caída completada':running?'Estado: esfera en movimiento':elapsed>0?'Estado: pausada':'Estado: lista para iniciar';
 drawChart(v);updateTable(v,total);
}
function drawChart(current){
 const c=$('chart'),ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);
 const p=params(),total=p.m*p.g*p.H,max=Math.max(1,total)*1.12,left=48,right=15,top=16,bottom=35,pw=w-left-right,ph=h-top-bottom;
 ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;ctx.font='12px sans-serif';ctx.fillStyle='#64748b';
 for(let i=0;i<=4;i++){let y=top+ph*i/4;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();ctx.fillText(fmt(max*(1-i/4)),4,y+4)}
 ctx.fillText('Energía (J)',left,12);ctx.fillText('Tiempo →',w/2-25,h-7);
 const totalT=Math.sqrt(2*p.H/p.g);
 const series=[['#2563eb',t=>p.m*p.g*(p.H-.5*p.g*t*t)],['#059669',t=>.5*p.m*p.g*p.g*t*t],['#f59e0b',()=>total]];
 series.forEach(([color,fn])=>{ctx.beginPath();for(let i=0;i<=100;i++){let t=totalT*i/100,x=left+pw*i/100,y=top+ph*(1-Math.max(0,fn(t))/max);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke()});
 const x=left+pw*Math.min(1,current.t/totalT);ctx.setLineDash([4,4]);ctx.strokeStyle='#475569';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,top+ph);ctx.stroke();ctx.setLineDash([]);
}
function updateTable(current,total){
 const p=params(),rows=[];const n=8;
 for(let i=0;i<=n;i++){let t=total*i/n,fall=.5*p.g*t*t,h=p.H-fall,v=Math.sqrt(2*p.g*fall),ec=.5*p.m*v*v,ep=p.m*p.g*h;rows.push(`<tr><td>${fmt(t)}</td><td>${fmt(h)}</td><td>${fmt(v)}</td><td>${fmt(ec)}</td><td>${fmt(ep)}</td></tr>`)}
 $('dataRows').innerHTML=rows.join('');
}
function tick(stamp){if(!running)return;if(lastStamp===null)lastStamp=stamp;let dt=Math.min((stamp-lastStamp)/1000,.05);lastStamp=stamp;elapsed+=dt;const p=params(),end=Math.sqrt(2*p.H/p.g);if(elapsed>=end){elapsed=end;running=false;finished=true;lastStamp=null;$('pause').textContent='Ⅱ Pausar';}render();if(running)raf=requestAnimationFrame(tick)}
function start(){if(finished){elapsed=0;finished=false}if(!running){running=true;lastStamp=null;raf=requestAnimationFrame(tick)}}
$('drop').addEventListener('click',start);
$('pause').addEventListener('click',()=>{running=!running;if(running){lastStamp=null;raf=requestAnimationFrame(tick)}else{cancelAnimationFrame(raf);lastStamp=null}render()});
$('reset').addEventListener('click',()=>{running=false;cancelAnimationFrame(raf);elapsed=0;finished=false;lastStamp=null;render()});
progress.addEventListener('input',()=>{running=false;cancelAnimationFrame(raf);const p=params();elapsed=Math.sqrt(2*p.H/p.g)*(+progress.value/100);finished=+progress.value===100;lastStamp=null;render()});
[mass,height,gravity].forEach(el=>el.addEventListener('input',()=>{running=false;cancelAnimationFrame(raf);elapsed=0;finished=false;lastStamp=null;progress.value=0;updateLabels();render()}));
updateLabels();render();

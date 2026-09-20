document.documentElement.classList.remove('no-js');
const journey=document.querySelector('.journey'),scene=document.querySelector('.scene'),runner=document.querySelector('.runner'),copy=document.querySelector('.hero-copy');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=n=>Math.max(0,Math.min(1,n));
let queued=false;
const ridge=[[0,.73],[.10,.78],[.15,.757],[.22,.79],[.29,.838],[.35,.85],[.42,.84],[.48,.861],[.54,.89],[.61,.88],[.67,.909],[.75,.905],[.82,.907],[.89,.89],[1,.938]];
function ridgeY(x){x=clamp(x);for(let i=1;i<ridge.length;i++){if(x<=ridge[i][0]){const a=ridge[i-1],b=ridge[i],prev=ridge[Math.max(0,i-2)],next=ridge[Math.min(ridge.length-1,i+1)];const t=(x-a[0])/(b[0]-a[0]),d=b[0]-a[0];const m0=(b[1]-prev[1])/(b[0]-prev[0]),m1=(next[1]-a[1])/(next[0]-a[0]);return (2*t*t*t-3*t*t+1)*a[1]+(t*t*t-2*t*t+t)*m0*d+(-2*t*t*t+3*t*t)*b[1]+(t*t*t-t*t)*m1*d}}return ridge.at(-1)[1]}
function render(){queued=false;if(reduced.matches){runner.style.opacity='0';copy.style.opacity='1';copy.style.transform='none';return}const rect=journey.getBoundingClientRect(),s=scene.getBoundingClientRect();const travel=journey.offsetHeight-scene.offsetHeight;const progress=clamp(-rect.top/travel);const scale=Math.max(s.width/1536,s.height/1024),iw=1536*scale,ih=1024*scale;const ox=(s.width-iw)/2,oy=s.height-ih;const startX=s.width*.08;const endX=s.width+runner.offsetWidth/2+2;const x=startX+(endX-startX)*progress;const y=s.top+oy+ridgeY((x-ox)/iw)*ih;runner.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-100%)`;runner.style.opacity=String(rect.top>50||x-runner.offsetWidth/2>=s.width?0:1);const frame=Math.floor(Math.max(0,-rect.top)/13)%6;runner.style.backgroundPosition=`${frame*20}% 50%`;copy.style.opacity=String(1-clamp(progress*1.8));copy.style.transform=`translateY(${-progress*65}px)`}
function schedule(){if(!queued){queued=true;requestAnimationFrame(render)}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);render();


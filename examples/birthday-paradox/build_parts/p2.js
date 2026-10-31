
/* ================= 模拟数据与画布 ================= */
const DAYS = SIM.firstDays.slice();
const COLLS = SIM.firstCollisions.map(([a,b,day])=>({a,b,day}));
const PAIRS = (()=>{ const out=[]; for(let i=0;i<23;i++) for(let j=i+1;j<23;j++) out.push([i,j]); return out; })();
const YOU = 0;

const cvBG = document.getElementById('bg'), ctBG = cvBG.getContext('2d');
const cvScene = document.getElementById('scene'), ctScene = cvScene.getContext('2d');
const starRnd = mulberry32(20261031);
const STARS = Array.from({length:120},()=>({x:starRnd()*1920,y:starRnd()*1080,r:starRnd()*1.5+.25,p:starRnd()*Math.PI*2,s:starRnd()*.35+.15}));
const DUST = Array.from({length:34},()=>({x:starRnd()*1920,y:starRnd()*760,r:starRnd()*2+.6,p:starRnd()*Math.PI*2,s:starRnd()*.5+.25}));

/* 背景：深蓝黑 + 极淡星点 + 暗角 */
function drawBG(t){
  ctBG.clearRect(0,0,1920,1080);
  const g = ctBG.createRadialGradient(960,470,80, 960,470,1250);
  g.addColorStop(0,'#10102A'); g.addColorStop(.48,'#090918'); g.addColorStop(1,'#04040C');
  ctBG.fillStyle = g; ctBG.fillRect(0,0,1920,1080);

  for(const s of STARS){
    const a = .18 + .42*Math.abs(Math.sin(t*.55 + s.p));
    ctBG.fillStyle = `rgba(224,228,246,${a})`;
    ctBG.beginPath(); ctBG.arc(s.x,s.y,s.r,0,Math.PI*2); ctBG.fill();
  }
  for(const d of DUST){
    const x = d.x + Math.sin(t*.18+d.p)*18;
    const y = d.y + Math.cos(t*.12+d.p)*10;
    ctBG.fillStyle = `rgba(201,169,106,${.05 + .05*Math.abs(Math.sin(t*.4+d.p))})`;
    ctBG.beginPath(); ctBG.arc(x,y,d.r,0,Math.PI*2); ctBG.fill();
  }
  const v = ctBG.createRadialGradient(960,500,420, 960,500,1180);
  v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,.42)');
  ctBG.fillStyle = v; ctBG.fillRect(0,0,1920,1080);

  /* 片名卡暗场里留两颗金点，成为全片记忆 */
  if(t>=13 && t<20){
    const a = .12 + .10*Math.abs(Math.sin((t-13)*.7));
    goldGlow(ctBG, 760, 510, 600, a, '#C9A96A');
    goldGlow(ctBG, 1180, 590, 520, a*.8, '#C9A96A');
  }
  if(t>=120){
    const k = clamp((t-120)/2.0,0,1);
    goldGlow(ctBG, 820, 380, 340, .08*k, '#C9A96A');
    goldGlow(ctBG, 1100, 620, 300, .07*k, '#C9A96A');
  }
}

function goldGlow(c,x,y,r,a,color){
  const g=c.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,rgba(color,a)); g.addColorStop(.35,rgba(color,a*.35)); g.addColorStop(1,rgba(color,0));
  c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
}

/* ================= 通用纸艺与标注 ================= */
function paperTexture(c,w,h,a=1){
  const g = c.createLinearGradient(-w/2,-h/2,w/2,h/2);
  g.addColorStop(0,`rgba(255,252,240,${.24*a})`); g.addColorStop(.55,`rgba(237,228,211,${.04*a})`);
  g.addColorStop(1,`rgba(124,102,72,${.10*a})`);
  c.fillStyle=g; c.fillRect(-w/2,-h/2,w,h);
  c.strokeStyle=`rgba(90,72,48,${.10*a})`; c.lineWidth=1;
  for(let i=0;i<7;i++){
    const yy=-h/2+8+i*h/7;
    c.beginPath(); c.moveTo(-w/2+8,yy); c.lineTo(w/2-8,yy); c.stroke();
  }
}

function drawPaperCard(c,x,y,w,h,num,day,opt={}){
  const rot=opt.rot||0, alpha=opt.alpha??1;
  c.save(); c.globalAlpha*=alpha; c.translate(x,y); c.rotate(rot);
  c.shadowColor='rgba(0,0,0,.55)'; c.shadowBlur=opt.shadow??20; c.shadowOffsetY=7;
  c.fillStyle='#EDE4D3'; roundRect(c,-w/2,-h/2,w,h,Math.min(6,w/10)); c.fill();
  c.shadowColor='transparent';
  paperTexture(c,w,h,.7);
  c.strokeStyle='rgba(70,52,30,.20)'; c.lineWidth=1; roundRect(c,-w/2+5,-h/2+5,w-10,h-10,3); c.stroke();

  const compact = w < 46;
  if(!compact){
    const hx=0, hy=-h*.20, hr=Math.min(w,h)*.11;
    c.fillStyle='rgba(74,58,39,.56)';
    c.beginPath(); c.arc(hx,hy,hr,0,Math.PI*2); c.fill();
    c.beginPath(); c.moveTo(-hr*1.55,hy+hr*2.1); c.quadraticCurveTo(0,hy+hr*.62,hr*1.55,hy+hr*2.1); c.closePath(); c.fill();
    c.font=`500 ${Math.max(12,w*.145)}px 'Noto Sans SC'`; c.fillStyle='rgba(74,58,39,.62)';
    c.textAlign='left'; c.textBaseline='top'; c.fillText('#'+String(num).padStart(2,'0'),-w/2+10,-h/2+8);
    c.font=`900 ${Math.max(16,w*.24)}px 'Noto Serif SC'`; c.fillStyle='#3A2E20';
    c.textAlign='center'; c.textBaseline='middle'; c.fillText(String(day),0,h*.26);
    c.font=`500 ${Math.max(9,w*.09)}px 'Noto Sans SC'`; c.fillStyle='rgba(74,58,39,.45)';
    c.fillText('BIRTH DATE',0,h*.26+Math.max(15,w*.16));
  } else {
    c.font=`900 ${Math.max(8,w*.34)}px 'Noto Serif SC'`; c.fillStyle='#3A2E20';
    c.textAlign='center'; c.textBaseline='middle'; c.fillText(String(day),0,1);
    c.font=`500 ${Math.max(6,w*.20)}px 'Noto Sans SC'`; c.fillStyle='rgba(74,58,39,.50)';
    c.textAlign='left'; c.textBaseline='top'; c.fillText('#'+num,-w/2+3,-h/2+2);
  }
  if(opt.gold){
    c.shadowColor=rgba('#C9A96A',.8); c.shadowBlur=18;
    c.strokeStyle=rgba('#C9A96A',.9); c.lineWidth=Math.max(2,w*.035);
    roundRect(c,-w/2-2,-h/2-2,w+4,h+4,3); c.stroke(); c.shadowColor='transparent';
  }
  c.restore();
}

function drawSeal(c,x,y,text,opt={}){
  const rot=opt.rot??-.08, s=opt.scale??1, a=opt.alpha??1, color=opt.color||CFG.accent;
  c.save(); c.globalAlpha*=a; c.translate(x,y); c.rotate(rot); c.scale(s,s);
  c.font=`900 ${opt.size||46}px 'Noto Serif SC'`; c.textAlign='center'; c.textBaseline='middle';
  const tw=c.measureText(text).width; const w=tw+44, h=(opt.size||46)+34;
  roundRect(c,-w/2,-h/2,w,h,4);
  c.fillStyle=rgba(color,.06); c.fill();
  c.strokeStyle=rgba(color,.86); c.lineWidth=3; c.stroke();
  roundRect(c,-w/2+6,-h/2+6,w-12,h-12,2);
  c.lineWidth=1.2; c.strokeStyle=rgba(color,.55); c.stroke();
  c.fillStyle=color; c.fillText(text,0,2);
  c.restore();
}

function drawPanel(c,x,y,w,h,opt={}){
  c.save(); c.globalAlpha*=opt.alpha??1;
  roundRect(c,x,y,w,h,10);
  c.fillStyle=opt.fill||'rgba(10,10,26,.66)'; c.fill();
  c.strokeStyle=opt.stroke||'rgba(201,169,106,.24)'; c.lineWidth=1.2; c.stroke();
  c.restore();
}

function drawRuleCard(c,t,x,y,w,h){
  const active = t<42.5?1:(t<45?2:3);
  c.save(); c.translate(x,y); c.rotate(-.025);
  c.shadowColor='rgba(0,0,0,.5)'; c.shadowBlur=28; c.shadowOffsetY=10;
  c.fillStyle='#EDE4D3'; roundRect(c,-w/2,-h/2,w,h,8); c.fill();
  c.shadowColor='transparent'; paperTexture(c,w,h,.8);
  c.strokeStyle='rgba(70,52,30,.22)'; c.lineWidth=1; roundRect(c,-w/2+7,-h/2+7,w-14,h-14,4); c.stroke();

  c.fillStyle='#3A2E20'; c.textAlign='left'; c.textBaseline='top';
  c.font="900 30px 'Noto Serif SC'"; c.fillText('游戏规则',-w/2+28,-h/2+24);
  c.font="500 13px 'Noto Sans SC'"; c.fillStyle='rgba(58,46,32,.55)'; c.fillText('THE RULES OF THE GAME',-w/2+29,-h/2+64);

  const rows=[
    ['①','365 天等概率','EVERY DAY EQUAL'],
    ['②','随机落格','LAND AT RANDOM'],
    ['③','同格 = 同一天','SAME SLOT = SAME DAY'],
  ];
  rows.forEach((r,i)=>{
    const yy=-h/2+105+i*86;
    const on=i<active;
    c.globalAlpha = on?1:.25;
    const glow=on?(1+.25*Math.abs(Math.sin(t*1.3+i))):0;
    c.fillStyle=on?rgba('#C9A96A',.12):'rgba(90,72,48,.05)';
    roundRect(c,-w/2+20,yy,w-40,68,6); c.fill();
    c.strokeStyle=on?rgba('#C9A96A',.5):'rgba(90,72,48,.16)'; c.lineWidth=1.2; c.stroke();
    c.fillStyle=on?'#9E6E2F':'rgba(58,46,32,.35)';
    c.font=`900 27px 'Noto Serif SC'`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(r[0],-w/2+52,yy+30);
    c.textAlign='left'; c.fillStyle=on?'#3A2E20':'rgba(58,46,32,.40)';
    c.font=`700 24px 'Noto Sans SC'`; c.fillText(r[1],-w/2+82,yy+23);
    c.font=`500 12px 'Noto Sans SC'`; c.fillStyle=on?'rgba(58,46,32,.52)':'rgba(58,46,32,.28)';
    c.fillText(r[2],-w/2+83,yy+50);
    if(on){ c.shadowColor=rgba('#C9A96A',.5); c.shadowBlur=14*glow; c.fillStyle=rgba('#C9A96A',.7);
      c.beginPath(); c.arc(-w/2+52,yy+30,3.2,0,Math.PI*2); c.fill(); c.shadowColor='transparent'; }
  });
  c.restore();
}

/* 右侧 0–100% 概率表：竖直刻度，50% 金线 */
function drawGauge(c,x,y,w,h,target,opt={}){
  const a=opt.alpha??1, compact=opt.compact, valColor=opt.color||CFG.accent;
  c.save(); c.globalAlpha*=a;
  const trackX = x + w*.52, top=y+42, bot=y+h-30, span=bot-top;
  if(!compact){
    drawPanel(c,x-24,y-26,w+48,h+52,{alpha:.85,stroke:'rgba(201,169,106,.20)'});
    c.fillStyle=rgba('#C9A96A',.78); c.font="500 15px 'Noto Sans SC'"; c.textAlign='left'; c.textBaseline='top';
    c.fillText('至少一对同一天',x,y-16);
    c.fillStyle='rgba(138,138,160,.7)'; c.font="500 10px 'Noto Sans SC'";
    c.fillText('PROBABILITY',x,y+3);
  }
  const ty = bot - clamp(target,0,100)/100*span;
  const gr=c.createLinearGradient(trackX,top, trackX,bot);
  gr.addColorStop(0, rgba('#C9A96A',.7)); gr.addColorStop(.5,rgba('#7FA6C8',.36)); gr.addColorStop(1,rgba('#7FA6C8',.08));
  roundRect(c,trackX-5,top,10,span,5); c.fillStyle='rgba(20,22,42,.78)'; c.fill();
  c.strokeStyle='rgba(201,169,106,.22)'; c.lineWidth=1; c.stroke();

  for(let p=0;p<=100;p+=10){
    const yy=bot-p/100*span;
    const major=p%20===0;
    c.strokeStyle=`rgba(138,138,160,${major?.32:.12})`;
    c.lineWidth=1; c.beginPath(); c.moveTo(trackX-13,yy); c.lineTo(trackX+13,yy); c.stroke();
    if(major && !compact){
      c.fillStyle='rgba(138,138,160,.62)'; c.font="400 11px 'Noto Sans SC'"; c.textAlign='right'; c.textBaseline='middle';
      c.fillText(p+'%',trackX-23,yy);
    }
  }
  const y50=bot-0.5*span;
  c.strokeStyle=rgba('#C9A96A',.55); c.lineWidth=1.3; c.setLineDash([6,5]);
  c.beginPath(); c.moveTo(trackX-20,y50); c.lineTo(trackX+24,y50); c.stroke(); c.setLineDash([]);
  c.fillStyle=rgba('#C9A96A',.8); c.font="500 12px 'Noto Sans SC'"; c.textAlign='left'; c.textBaseline='middle';
  c.fillText('50%',trackX+28,y50-9);

  const pulse=.55+.45*Math.abs(Math.sin(performanceSafeTime()*.9));
  goldGlow(c,trackX,ty,compact?18:30,.16*pulse,valColor);
  c.fillStyle=valColor; c.beginPath(); c.arc(trackX,ty,compact?4.5:6,0,Math.PI*2); c.fill();
  c.strokeStyle=rgba('#F1D9A8',.7); c.lineWidth=1; c.stroke();
  c.strokeStyle=rgba('#C9A96A',.55); c.lineWidth=1;
  c.beginPath(); c.moveTo(trackX,y50); c.lineTo(trackX,ty); c.stroke();

  if(!compact){
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle=valColor; c.font="900 46px 'Noto Serif SC'";
    c.fillText(target.toFixed(1)+'%',x+w*.40,y+46);
    c.fillStyle='rgba(138,138,160,.8)'; c.font="500 12px 'Noto Sans SC'";
    c.fillText(opt.sub||'',x+w*.40,y+78);
  }
  c.restore();
}

/* 当前渲染时间（保证 render(t) 纯函数：绘制只读这个变量） */
let NOW=0;
function performanceSafeTime(){ return NOW; }

/* ================= 365 格生日旅馆墙 ================= */
function wallCell(layout,day){
  const i=day-1, col=i%25, row=Math.floor(i/25);
  return {
    x:layout.x + col*(layout.cw+layout.gx),
    y:layout.y + row*(layout.ch+layout.gy),
    cw:layout.cw, ch:layout.ch
  };
}
function drawWall(c,t,L={}){
  const x=L.x??470, y=L.y??140, cw=L.cw??42, ch=L.ch??36, gx=L.gx??5, gy=L.gy??5;
  const a=L.alpha??1;
  const lit=L.litDays||null, gold=L.goldDays||null, all=L.allLit;
  c.save(); c.globalAlpha*=a;
  for(let day=1;day<=375;day++){
    const col=(day-1)%25, row=Math.floor((day-1)/25);
    const px=x+col*(cw+gx), py=y+row*(ch+gy);
    const valid=day<=365;
    const isLit=all || (lit && lit.has(day));
    const isGold=gold && gold.has(day);
    const breath=.5+.5*Math.sin(t*.8 + day*.17);
    roundRect(c,px,py,cw,ch,Math.max(2,cw*.07));
    if(!valid){
      c.fillStyle='rgba(127,166,200,.012)'; c.fill();
      c.strokeStyle='rgba(127,166,200,.035)'; c.lineWidth=.7; c.stroke();
    } else if(isGold){
      c.fillStyle=rgba('#C9A96A',.30+.12*breath); c.fill();
      c.shadowColor=rgba('#C9A96A',.65); c.shadowBlur=14+8*breath;
      c.strokeStyle=rgba('#F1D9A8',.85); c.lineWidth=1.8; c.stroke(); c.shadowColor='transparent';
    } else if(isLit){
      c.fillStyle=rgba('#7FA6C8',.18+.10*breath); c.fill();
      c.strokeStyle=rgba('#7FA6C8',.58); c.lineWidth=1.1; c.stroke();
    } else {
      c.fillStyle=rgba('#7FA6C8',.105); c.fill();
      c.strokeStyle=rgba('#7FA6C8',.27); c.lineWidth=.8; c.stroke();
    }
  }
  c.restore();
}

function drawCollisionGlow(c,x,y,t,scale=1,alpha=1){
  const k=.7+.3*Math.abs(Math.sin(t*1.15));
  goldGlow(c,x,y,64*scale,.22*alpha*k,'#C9A96A');
  c.save(); c.globalAlpha*=alpha; c.strokeStyle=rgba('#C9A96A',.92); c.lineWidth=2.2;
  c.beginPath(); c.arc(x,y,25*scale,0,Math.PI*2); c.stroke();
  c.strokeStyle=rgba('#F1D9A8',.38); c.lineWidth=1;
  c.beginPath(); c.arc(x,y,33*scale,0,Math.PI*2); c.stroke();
  c.restore();
}

function drawRoomGrid(c,t,opt={}){
  const x0=opt.x??442, y0=opt.y??132, cw=opt.cw??20, ch=opt.ch??15, gx=opt.gx??4, gy=opt.gy??4;
  const alpha=opt.alpha??1, upto=opt.upto??1000;
  c.save(); c.globalAlpha*=alpha;
  for(let i=0;i<1000;i++){
    const col=i%40, row=Math.floor(i/40);
    const px=x0+col*(cw+gx), py=y0+row*(ch+gy);
    const on=i<upto;
    const hit=SIM_FLAGS.charCodeAt(i)===49;
    roundRect(c,px,py,cw,ch,2);
    if(!on){ c.fillStyle='rgba(127,166,200,.03)'; c.fill(); c.strokeStyle='rgba(127,166,200,.07)'; c.lineWidth=.5; c.stroke(); }
    else if(hit){
      const b=.5+.5*Math.sin(t*.8+i*.2);
      c.fillStyle=rgba('#C9A96A',.16+.10*b); c.fill();
      c.strokeStyle=rgba('#C9A96A',.65); c.lineWidth=.9; c.stroke();
    } else {
      c.fillStyle=`rgba(127,166,200,${.10+.05*Math.abs(Math.sin(t*.5+i*.1))})`; c.fill();
      c.strokeStyle='rgba(127,166,200,.28)'; c.lineWidth=.7; c.stroke();
    }
  }
  c.restore();
}

/* 从 sim 表查前 n 间房命中数 */
function hitCountAt(n){ return SIM_PREFIX[clamp(n,0,1000)]; }


/* ================= 40–63.5s 规则卡 + 第一次实验 ================= */
const LAY_W={x:430,y:142,cw:40,ch:34,gx:5,gy:5};

function dayOccurrence(day,index){
  let occ=0;
  for(let k=0;k<index;k++) if(DAYS[k]===day) occ++;
  return occ;
}

function drawRuleStage(c,t){
  if(t<40 || t>=47.5) return;
  const a=clamp((t-40)/.5,0,1);
  drawWall(c,t,{...LAY_W,alpha:.82,litDays:t>45?new Set([194]):null,goldDays:t>46?new Set([194]):null});
  drawRuleCard(c,t,232,448,306,352);
  c.save(); c.globalAlpha=a;

  /* 墙顶 23 张纸卡排成一行（45s 起让前两张先落下） */
  SEATS.forEach((s,i)=>{
    if(t>=45 && i<2) return;
    const x=sideQueueX(i,23);
    drawPaperCard(c,x,112,31,40,i+1,'?',{rot:Math.sin(i*1.7)*.05,shadow:7});
  });
  c.restore();

  /* 45s 起，两张卡落进同一格 */
  if(t>=45){
    const p=easeInOut(clamp((t-45)/1.25,0,1));
    const cell=wallCell(LAY_W,194);
    const tx=cell.x+cell.cw/2, ty=cell.y+cell.ch/2;
    for(let k=0;k<2;k++){
      const sx=sideQueueX(1+k,23), sy=112;
      drawPaperCard(c,lerp(sx,tx+(k?5:-5),p),lerp(sy,ty,p)+Math.sin(Math.PI*p)*55,30,38,2+k,194,{rot:lerp(-.08,.02,p),gold:p>.92,shadow:6});
    }
    drawCollisionGlow(c,tx,ty,t,.84,p);
  }
}

function sideQueueX(i,n){
  const gap=42, x0=960-(n-1)*gap/2;
  return x0+i*gap;
}

function drawFirstTrial(c,t){
  if(t<47.5 || t>=63.5) return;
  const zoomState=focusZoom(t);
  const drawLanded = ()=> {
    const landed=DAYS.filter((d,i)=>t >= 50.05+i*.16+.48);
    const lit=new Set(landed);
    const gold=new Set([194,222].filter(d=>landed.filter(x=>x===d).length>=2));
    drawWall(c,t,{...LAY_W,alpha:1,litDays:lit,goldDays:gold});

    /* 落格进度 */
    SEATS.forEach((s,i)=>{
      const start=50.05+i*.16, dur=.48;
      const p=easeInOut(clamp((t-start)/dur,0,1));
      const day=DAYS[i], cell=wallCell(LAY_W,day);
      const occ=dayOccurrence(day,i);
      const off=(occ?9:-9);
      const queueX=sideQueueX(i,23), queueY=108;
      const slotX=cell.x+cell.cw/2+off;
      const slotY=cell.y+cell.ch/2;
      if(p<=0){
        drawPaperCard(c,queueX,queueY,31,40,i+1,'?',{rot:Math.sin(i*1.7)*.05,shadow:7});
        return;
      }
      const x=lerp(queueX,slotX,p), y=lerp(queueY,slotY,p)-Math.sin(Math.PI*p)*90;
      const scl=lerp(.78,.50,p);
      drawPaperCard(c,x,y,62*scl,78*scl,i+1,day,{rot:lerp(Math.sin(i*2.0)*.10,0,p),gold:(day===194||day===222)&&p>.94,shadow:6});
    });
    if(t>55.2){
      [194,222].forEach(day=>{
        const cell=wallCell(LAY_W,day);
        drawCollisionGlow(c,cell.x+cell.cw/2,cell.y+cell.ch/2,t,.85,clamp((t-55.2)/.5,0,1));
      });
    }
  };

  if(zoomState.z>1.001){
    const {z, fx, fy}=zoomState;
    c.save();
    c.translate(960,436); c.scale(z,z); c.translate(-fx,-fy);
    drawLanded();
    c.restore();
  } else drawLanded();

  /* 计数器（不随镜头缩放） */
  const landedN=DAYS.filter((d,i)=>t>=50.05+i*.16+.48).length;
  const hits=[194,222].filter(d=>DAYS.filter((x,i)=>x===d && t>=50.05+i*.16+.48).length>=2).length;
  c.save();
  drawPanel(c,1600,158,258,176,{alpha:clamp((t-47.5)/.5,0,1),stroke:'rgba(201,169,106,.22)'});
  c.globalAlpha=clamp((t-47.5)/.5,0,1);
  c.textAlign='left'; c.textBaseline='top';
  c.fillStyle='rgba(138,138,160,.8)'; c.font="500 14px 'Noto Sans SC'";
  c.fillText('第 1 次实验 · 模拟',1622,180);
  c.fillStyle=CFG.ink; c.font="900 54px 'Noto Serif SC'";
  c.fillText(landedN+' / 23',1620,205);
  c.fillStyle='rgba(138,138,160,.65)'; c.font="500 13px 'Noto Sans SC'";
  c.fillText('已落格',1622,270);
  c.fillStyle=hits===2?CFG.accent:'rgba(138,138,160,.4)'; c.font="700 21px 'Noto Sans SC'";
  c.fillText('碰撞 '+hits,1622,294);
  if(hits===2) goldGlow(c,1784,305,40,.13,'#C9A96A');
  c.restore();

  /* 细节标签 */
  if(t>=56.0 && t<58.5) drawDayLabel(c,'DAY 194','第 2 人 × 第 8 人',194,t);
  if(t>=58.5 && t<61.0) drawDayLabel(c,'DAY 222','第 3 人 × 第 9 人',222,t);
  if(t>54.6 && t<56.0){
    c.save(); c.globalAlpha=clamp((t-54.6)/.4,0,1);
    c.fillStyle=rgba('#C9A96A',.8); c.font="700 15px 'Noto Sans SC'"; c.textAlign='center';
    c.fillText('1 次实验 · 2 处碰撞',960,708); c.restore();
  }
}

function drawDayLabel(c,big,small,day,t){
  const a=clamp((t-56.0)/.4,0,1)*(1-clamp((t-58.5)/.4,0,1)) + clamp((t-58.5)/.4,0,1)*(1-clamp((t-61.0)/.4,0,1));
  if(a<=0) return;
  c.save(); c.globalAlpha=a;
  c.fillStyle=rgba('#C9A96A',.95); c.font="900 30px 'Noto Serif SC'"; c.textAlign='center'; c.textBaseline='middle';
  c.fillText(big,960,695);
  c.fillStyle='rgba(138,138,160,.9)'; c.font="500 15px 'Noto Sans SC'";
  c.fillText(small,960,730);
  c.restore();
}

function focusZoom(t){
  let z=1;
  let from=194, to=194;
  if(t>=55.3 && t<56.3) z=lerp(1,2.65,easeInOut((t-55.3)/1.0));
  else if(t>=56.3 && t<58.4) z=2.65;
  else if(t>=58.4 && t<59.3){
    z=2.65; from=194; to=222;
    const k=easeInOut((t-58.4)/.9);
    return {z,fx:lerp(focusFor(194).x,focusFor(222).x,k),fy:lerp(focusFor(194).y,focusFor(222).y,k)};
  } else if(t>=59.3 && t<60.5) z=2.65;
  else if(t>=60.5 && t<61.8) z=lerp(2.65,1,easeInOut((t-60.5)/1.3));
  if(t>=58.4) from=222;
  const f=focusFor(from);
  return {z,fx:f.x,fy:f.y};
}
function focusFor(day){
  const cell=wallCell(LAY_W,day);
  return {x:cell.x+cell.cw/2, y:cell.y+cell.ch/2};
}

/* ================= 63.5–72s 一千间房 ================= */
const GRID={x:442,y:146,cw:20,ch:15,gx:4,gy:4};

function drawThousand(c,t){
  if(t<63.5 || t>=73.0) return;
  const shrink=easeInOut(clamp((t-63.5)/2.6,0,1));
  const gridA=clamp((t-64.2)/2.2,0,1)*(1-clamp((t-72.2)/.75,0,1));
  if(shrink>0){
    const L={
      x:lerp(LAY_W.x,202,shrink), y:lerp(LAY_W.y,170,shrink),
      cw:lerp(LAY_W.cw,7.4,shrink), ch:lerp(LAY_W.ch,6.2,shrink),
      gx:lerp(LAY_W.gx,1,shrink), gy:lerp(LAY_W.gy,1,shrink)
    };
    drawWall(c,t,{...L,alpha:1-shrink*.05,litDays:new Set(DAYS),goldDays:new Set([194,222])});
    if(t>65){
      c.save(); c.globalAlpha=clamp((t-65)/.5,0,1);
      c.fillStyle=rgba('#C9A96A',.7); c.font="500 12px 'Noto Sans SC'"; c.textAlign='center';
      c.fillText('第 1 间房',246,336); c.restore();
    }
  }
  if(gridA<=0) return;
  const upto=t<67?0:Math.floor(clamp((t-67)/2.4,0,1)*1000);
  drawRoomGrid(c,t,{...GRID,alpha:gridA,upto});
  const hits=hitCountAt(upto);
  c.save(); c.globalAlpha=gridA;
  c.textAlign='left'; c.textBaseline='top';
  c.fillStyle='rgba(138,138,160,.8)'; c.font="500 14px 'Noto Sans SC'";
  c.fillText('1000 次重复 · 每间房 23 人 · 模拟',444,104);
  drawPanel(c,1454,150,352,230,{stroke:'rgba(201,169,106,.20)'});
  c.fillStyle=CFG.ink; c.font="900 64px 'Noto Serif SC'";
  c.fillText(upto.toLocaleString('en-US'),1476,188);
  c.fillStyle='rgba(138,138,160,.86)'; c.font="500 22px 'Noto Sans SC'";
  c.fillText('/ 1000 间房',1478,262);
  c.fillStyle='rgba(138,138,160,.6)'; c.font="500 13px 'Noto Sans SC'";
  c.fillText('出现同一天',1478,300);
  c.fillStyle=CFG.accent; c.font="900 46px 'Noto Serif SC'";
  c.fillText(hits,1478,324);
  goldGlow(c,1528,342,72,.10*gridA,'#C9A96A');
  c.restore();

  if(t>=69.5){
    const a=clamp((t-69.5)/.5,0,1)*(1-clamp((t-71.4)/1.0,0,1));
    if(a<=0) return;
    c.save(); c.globalAlpha=a;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle=CFG.accent; c.font="900 86px 'Noto Serif SC'";
    c.fillText('510 / 1000',960,705);
    c.fillStyle='rgba(138,138,160,.8)'; c.font="500 15px 'Noto Sans SC'";
    c.fillText('模拟 51.0%　·　理论 50.7%　·　模拟数据',960,748);
    c.restore();
  }
}

/* ================= 72–82s 同一问题，六个数 ================= */
function drawPeopleRoom(c,x,y,w,h,count,t,opt={}){
  drawPanel(c,x,y,w,h,{fill:'rgba(9,9,24,.62)',stroke:'rgba(127,166,200,.22)'});
  c.save();
  c.textAlign='left'; c.textBaseline='top';
  c.fillStyle=rgba('#C9A96A',.8); c.font="500 13px 'Noto Sans SC'";
  c.fillText(opt.label||'小房间',x+22,y+18);
  c.fillStyle='rgba(138,138,160,.7)'; c.font="500 11px 'Noto Sans SC'";
  c.fillText(opt.en||'ONE ROOM',x+22,y+38);

  const cols=6, cw=82, chh=86, gx=14, gy=10;
  const x0=x+w/2-(cols*cw+(cols-1)*gx)/2;
  const y0=y+66;
  for(let i=0;i<30;i++){
    if(i>=count) break;
    const col=i%cols, row=Math.floor(i/cols);
    const cx=x0+cw/2+col*(cw+gx), cy=y0+chh/2+row*(chh+gy);
    const pair=(i===0||i===1);
    drawPaperCard(c,cx+(pair?(i?9:-9):0),cy,50,58,i+1, (pair?194:DAYS[i%23]), {rot:Math.sin(i*2.4)*.06,shadow:6,gold:pair});
  }
  if(count>0) drawCollisionGlow(c,x0+cw/2,y0+chh/2,t,.75,1);

  c.textAlign='right'; c.textBaseline='top';
  c.fillStyle=CFG.ink; c.font="900 34px 'Noto Serif SC'";
  c.fillText(count+' 人',x+w-22,y+16);
  c.restore();
}

function drawSixNumbers(c,t){
  if(t<72 || t>=84) return;
  const a=clamp((t-72)/.5,0,1)*(1-clamp((t-82.3)/1.2,0,1));
  if(a<=0) return;
  let count=23, target=50.7, color=CFG.accent, label='23 人';
  if(t>=74.5 && t<77){ count=22; target=47.6; color=CFG.red; label='22 人'; }
  else if(t>=79.5){ count=30; target=70.6; color=CFG.accent; label='30 人'; }
  else if(t>=77) { count=23; target=50.7; color=CFG.accent; label='23 人'; }
  if(t>=72 && t<74.5) target=lerp(51.0,50.7,clamp((t-72)/.8,0,1));

  c.save(); c.globalAlpha*=a;
  drawPeopleRoom(c,190,200,690,450,count,t,{label:label+' · 同一间房',en:'ONE ROOM · 23 PEOPLE'});
  drawGauge(c,1500,188,320,500,target,{compact:false,sub:label+' 的答案',color});
  c.restore();

  /* 22 → 23 跨线时闪一下 */
  if(t>=77.1 && t<79.1){
    const k=Math.abs(Math.sin((t-77.1)*2.3));
    goldGlow(c,960,235,250,.05*k,'#C9A96A');
  }
}

/* ================= 82–90s 理论曲线 ================= */
const PROBS = (()=>{ const a=[0]; let p=1; for(let n=1;n<=100;n++){ p*= (366-n)/365; a.push(1-p);} return a; })();
function prob(n){ return PROBS[clamp(n,0,100)]; }

const CURVE={x0:260,y0:652,x1:1450,ytop:170};
function curveX(n){ return CURVE.x0 + n/100*(CURVE.x1-CURVE.x0); }
function curveY(p){ return CURVE.y0 - p* (CURVE.y0-CURVE.ytop); }

function drawCurveChart(c,t){
  if(t<82 || t>=90.5) return;
  const a=clamp((t-82)/.6,0,1)*(1-clamp((t-89.6)/.9,0,1));
  if(a<=0) return;
  const nEnd=lerp(0,70,easeInOut(clamp((t-82)/3.0,0,1)));
  c.save(); c.globalAlpha*=a;

  /* 坐标轴 */
  c.strokeStyle='rgba(138,138,160,.28)'; c.lineWidth=1.2;
  c.beginPath(); c.moveTo(CURVE.x0,CURVE.ytop-10); c.lineTo(CURVE.x0,CURVE.y0); c.lineTo(CURVE.x1,CURVE.y0); c.stroke();
  c.fillStyle='rgba(138,138,160,.66)'; c.font="500 14px 'Noto Sans SC'"; c.textAlign='center'; c.textBaseline='top';
  for(const n of [0,20,40,60,80,100]){
    const x=curveX(n);
    c.strokeStyle='rgba(138,138,160,.18)'; c.beginPath(); c.moveTo(x,CURVE.y0); c.lineTo(x,CURVE.y0+6); c.stroke();
    c.fillText(String(n),x,CURVE.y0+12);
  }
  c.textAlign='right'; c.textBaseline='middle';
  for(const p of [0,25,50,75,100]){
    const y=curveY(p/100);
    c.fillStyle='rgba(138,138,160,.62)'; c.fillText(p+'%',CURVE.x0-18,y);
    c.strokeStyle='rgba(138,138,160,.14)'; c.beginPath(); c.moveTo(CURVE.x0-10,y); c.lineTo(CURVE.x0,y); c.stroke();
  }
  c.textAlign='left'; c.textBaseline='top';
  c.fillStyle='rgba(138,138,160,.70)'; c.font="500 13px 'Noto Sans SC'";
  c.fillText('房间人数',CURVE.x0,CURVE.y0+38);
  c.save(); c.translate(CURVE.x0-88,curveY(.5)); c.rotate(-Math.PI/2);
  c.fillText('至少一对同一天',0,0); c.restore();

  /* 50% 金线 */
  const y50=curveY(.5072972343239857);
  c.strokeStyle=rgba('#C9A96A',.55); c.lineWidth=1.2; c.setLineDash([6,5]);
  c.beginPath(); c.moveTo(CURVE.x0+4,y50); c.lineTo(CURVE.x1,y50); c.stroke(); c.setLineDash([]);
  c.fillStyle=rgba('#C9A96A',.72); c.font="500 13px 'Noto Sans SC'"; c.textAlign='left';
  c.fillText('50.7%',CURVE.x0+8,y50-19);

  /* 曲线下方的淡金渐变 */
  const pts=[];
  for(let i=0;i<=Math.max(2,Math.floor(nEnd));i++){
    const n=i, p=prob(n);
    pts.push([curveX(n),curveY(p)]);
  }
  if(nEnd>0){
    c.beginPath(); c.moveTo(curveX(0),curveY(0));
    for(const [x,y] of pts) c.lineTo(x,y);
    c.lineTo(curveX(nEnd),CURVE.y0); c.closePath();
    const g=c.createLinearGradient(0,CURVE.ytop,0,CURVE.y0);
    g.addColorStop(0,'rgba(201,169,106,.02)'); g.addColorStop(1,'rgba(201,169,106,.10)');
    c.fillStyle=g; c.fill();

    c.save(); c.shadowColor=rgba('#C9A96A',.55); c.shadowBlur=18;
    c.strokeStyle=rgba('#E7CFA0',.94); c.lineWidth=2.4; c.beginPath();
    c.moveTo(pts[0][0],pts[0][1]);
    for(const [x,y] of pts) c.lineTo(x,y);
    c.stroke(); c.restore();
    const last=pts[pts.length-1];
    goldGlow(c,last[0],last[1],26,.2,'#C9A96A');
    c.fillStyle=CFG.accent; c.beginPath(); c.arc(last[0],last[1],5,0,Math.PI*2); c.fill();
  }

  /* 关键点 */
  const marks=[
    {n:23,p:prob(23),label:'23 人'},
    {n:30,p:prob(30),label:'30 人'},
    {n:70,p:prob(70),label:'70 人'},
  ];
  marks.forEach(m=>{
    if(nEnd<m.n-1) return;
    if(m.n===70 && t>=85) return;
    const x=curveX(m.n), y=curveY(m.p);
    const is70=m.n===70;
    c.fillStyle=is70?CFG.accent:rgba('#7FA6C8',.9);
    c.beginPath(); c.arc(x,y,is70?6:4,0,Math.PI*2); c.fill();
    c.fillStyle=is70?rgba('#C9A96A',.84):'rgba(138,138,160,.62)';
    c.font=`${is70?700:500} ${is70?17:12}px 'Noto Sans SC'`; c.textAlign='left'; c.textBaseline='bottom';
    c.fillText(m.label+' · '+(m.p*100).toFixed(1)+'%',x+9,y-8);
  });

  if(t>=85){
    const a70=clamp((t-85)/.5,0,1);
    const x=curveX(70), y=curveY(prob(70));
    c.save(); c.globalAlpha*=a70;
    c.strokeStyle=rgba('#C9A96A',.45); c.lineWidth=1.1; c.setLineDash([5,5]);
    c.beginPath(); c.moveTo(x,y); c.lineTo(x,CURVE.y0); c.stroke(); c.setLineDash([]);
    c.textAlign='right'; c.textBaseline='middle';
    c.fillStyle=CFG.accent; c.font="900 42px 'Noto Serif SC'";
    c.fillText('99.9%',x-14,y-26);
    c.fillStyle='rgba(138,138,160,.8)'; c.font="500 13px 'Noto Sans SC'";
    c.fillText('70 人 · 理论曲线',x-14,y-64);
    c.restore();
  }

  if(t>=87.4){
    const k=.65+.35*Math.abs(Math.sin((t-87.4)*1.5));
    c.save(); c.globalAlpha*=.75*k;
    c.fillStyle=CFG.accent; c.font="900 78px 'Noto Serif SC'"; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('?',curveX(35),curveY(.88)); c.restore();
  }
  c.fillStyle='rgba(138,138,160,.52)'; c.font="500 12px 'Noto Sans SC'"; c.textAlign='right'; c.textBaseline='top';
  c.fillText('理论曲线 · 公式计算',CURVE.x1,CURVE.y0+38);
  c.restore();
}

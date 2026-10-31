
/* ================= 0–13s 钩子：教室 → 365 格墙 → 两格相撞 ================= */
const SEATS = (()=>{
  const out=[]; let n=0;
  for(let row=0;row<5;row++){
    const cols=row===4?3:5;
    for(let col=0;col<cols;col++){
      out.push({n:++n, col, cols, row});
    }
  }
  return out;
})();

function seatPos(seat){
  const gapX=174, gapY=96;
  return {
    x: 960 + (seat.col-(seat.cols-1)/2)*gapX,
    y: 294 + seat.row*gapY
  };
}

function drawClassroom(c,t,extraA=1){
  const k = clamp((t-0.0)/1.2,0,1)*extraA;
  const zoom = 1 + .035*easeOut(clamp(t/3,0,1));
  c.save(); c.globalAlpha=k;
  c.translate(960,520); c.scale(zoom,zoom); c.translate(-960,-520);

  /* 教室地面与课桌 */
  const floor = c.createLinearGradient(0,380,0,760);
  floor.addColorStop(0,'rgba(30,32,54,.25)'); floor.addColorStop(1,'rgba(5,5,14,.02)');
  c.fillStyle=floor; c.fillRect(0,330,1920,430);
  c.strokeStyle='rgba(127,166,200,.08)'; c.lineWidth=1;
  for(let y=420;y<760;y+=76){ c.beginPath(); c.moveTo(180,y); c.lineTo(1740,y); c.stroke(); }
  for(let x=260;x<1740;x+=166){ c.beginPath(); c.moveTo(x,360); c.lineTo(x-70,760); c.stroke(); }

  SEATS.forEach((seat,i)=>{
    const p=seatPos(seat);
    const bob=Math.sin(t*.9+i*.7)*2.0;
    c.save(); c.translate(p.x,p.y+bob);
    c.fillStyle='rgba(12,13,28,.78)'; roundRect(c,-70,-36,140,58,7); c.fill();
    c.strokeStyle='rgba(201,169,106,.10)'; c.lineWidth=1; c.stroke();
    drawPaperCard(c,0,-8,82,100,seat.n,'?',{rot:Math.sin(i*2.1)*.05,shadow:12});
    c.restore();
  });

  /* 教室铭牌 */
  c.fillStyle='rgba(201,169,106,.72)'; c.font="500 16px 'Noto Sans SC'"; c.textAlign='center'; c.textBaseline='top';
  c.fillText('一间教室 · A CLASSROOM',960,158);
  c.fillStyle='rgba(138,138,160,.6)'; c.font="500 12px 'Noto Sans SC'";
  c.fillText('23 个座位 · 23 个日期',960,183);
  c.restore();
}

function drawHookWall(c,t,extraA=1){
  c.save(); c.globalAlpha*=extraA;
  const layout={x:470,y:150,cw:42,ch:36,gx:5,gy:5,alpha:1};
  const lit=new Set(DAYS), gold=new Set([194,222]);
  drawWall(c,t,{...layout,litDays:lit,goldDays:gold});

  /* 23 张纸卡：3.0s 起从座位飞进格子 */
  SEATS.forEach((seat,i)=>{
    const start=3.0+i*.035, dur=.78;
    const p=easeInOut(clamp((t-start)/dur,0,1));
    if(p<=0){
      const q=seatPos(seat);
      drawPaperCard(c,q.x,q.y-8,82,100,seat.n,DAYS[i],{rot:Math.sin(i*2.1)*.05,shadow:12});
      return;
    }
    const day=DAYS[i], cell=wallCell(layout,day);
    const tx=cell.x+cell.cw/2, ty=cell.y+cell.ch/2;
    const qx=seatPos(seat).x, qy=seatPos(seat).y-8;
    const x=lerp(qx,tx,p), y=lerp(qy,ty,p)-Math.sin(Math.PI*p)*175;
    const rot=lerp(Math.sin(i*2.1)*.10,0,p);
    const scl=lerp(.90,.34,p);
    const ga=c.globalAlpha;
    if(p<1) c.globalAlpha = ga*clamp(1-.15*p,0,1);
    drawPaperCard(c,x,y,82*scl,100*scl,seat.n,day,{rot,shadow:8,gold:gold.has(day)});
    c.globalAlpha=ga;
  });

  /* 落地后两处碰撞的连线 */
  if(t>4.5){
    const a=clamp((t-4.5)/1.0,0,1);
    const c1=wallCell(layout,194), c2=wallCell(layout,222);
    [[c1,1],[c2,2]].forEach(([cell,idx])=>{
      const cx=cell.x+cell.cw/2, cy=cell.y+cell.ch/2;
      drawCollisionGlow(c,cx,cy,t,1,a);
      c.save(); c.globalAlpha*=a; c.strokeStyle=rgba('#C9A96A',.7); c.lineWidth=1.4;
      c.beginPath(); c.moveTo(cx-12,cy); c.lineTo(cx+12,cy); c.stroke(); c.restore();
    });
    c.save(); c.globalAlpha*=a; c.font="500 15px 'Noto Sans SC'"; c.fillStyle=rgba('#C9A96A',.85);
    c.textAlign='center'; c.textBaseline='top';
    c.fillText('两天相撞',960,698); c.restore();
  }
  c.restore();
}

function drawComparison(c,t){
  const a=clamp((t-8.0)/.7,0,1) * (1-clamp((t-12.6)/.4,0,1));
  if(a<=0) return;
  c.save(); c.globalAlpha*=a;
  drawWall(c,t,{x:90,y:206,cw:31,ch:27,gx:4,gy:4,litDays:new Set(DAYS),goldDays:new Set([194,222])});

  const rightX=1190, top=252, gap=118, rowGap=86;
  SEATS.forEach((s,i)=>{
    const col=i%5, row=Math.floor(i/5);
    const x=rightX+col*gap, y=top+row*rowGap;
    drawPaperCard(c,x,y,72,86,i+1,DAYS[i],{rot:Math.sin(i*3.2)*.06,shadow:10});
  });
  c.fillStyle='rgba(138,138,160,.62)'; c.font="500 14px 'Noto Sans SC'"; c.textAlign='center'; c.textBaseline='top';
  c.fillText('23 张纸卡',1490,690);

  /* 中间的 23 / 365 */
  c.textAlign='center'; c.textBaseline='middle';
  c.fillStyle=CFG.ink; c.font="900 52px 'Noto Serif SC'"; c.fillText('23',1014,365);
  c.strokeStyle=rgba('#C9A96A',.55); c.lineWidth=1.2;
  c.beginPath(); c.moveTo(968,397); c.lineTo(1060,397); c.stroke();
  c.fillStyle='rgba(127,166,200,.9)'; c.font="900 52px 'Noto Serif SC'"; c.fillText('365',1014,435);
  c.fillStyle='rgba(138,138,160,.65)'; c.font="500 13px 'Noto Sans SC'"; c.fillText('23 次抽奖？',1014,490);

  /* 金色结论印章 */
  if(t>=10.5){
    const p=easeOut(clamp((t-10.5)/.55,0,1));
    drawSeal(c,1015,594,'> 50%',{scale:.72+p*.30,rot:-.06,alpha:clamp((t-10.5)/.5,0,1),size:64});
  }
  c.restore();
}

/* ================= 20–40s 文献复原：1939 伊斯坦布尔 ================= */
function drawPaperMiniWall(c,t,x,y,cw,ch,gx,gy){
  const litN=t>26?Math.min(23,Math.floor((t-26)/.11)+1):0;
  for(let day=1;day<=375;day++){
    const col=(day-1)%25, row=Math.floor((day-1)/25);
    const px=x+col*(cw+gx), py=y+row*(ch+gy);
    const valid=day<=365;
    const idx=DAYS.indexOf(day);
    const lit=idx>=0 && idx<litN;
    const gold=lit && (day===194||day===222);
    roundRect(c,px,py,cw,ch,1.2);
    if(!valid){ c.fillStyle='rgba(74,58,39,.025)'; c.fill(); }
    else if(gold){
      c.fillStyle='rgba(137,92,32,.52)'; c.fill(); c.strokeStyle='rgba(137,92,32,.82)'; c.lineWidth=1; c.stroke();
    } else if(lit){
      c.fillStyle='rgba(39,78,110,.34)'; c.fill(); c.strokeStyle='rgba(39,78,110,.58)'; c.lineWidth=.8; c.stroke();
    } else {
      c.fillStyle='rgba(74,58,39,.075)'; c.fill(); c.strokeStyle='rgba(74,58,39,.16)'; c.lineWidth=.6; c.stroke();
    }
  }
  if(litN>0){
    DAYS.slice(0,litN).forEach((day)=>{
      const col=(day-1)%25, row=Math.floor((day-1)/25);
      const px=x+col*(cw+gx)+cw/2, py=y+row*(ch+gy)+ch/2;
      c.fillStyle=(day===194||day===222)?'#C9A96A':'rgba(32,66,96,.92)';
      c.beginPath(); c.arc(px,py,1.9,0,Math.PI*2); c.fill();
    });
  }
}

function drawLiteraturePage(c,t,alpha=1,scale=1,yOff=0){
  if(alpha<=0) return;
  const w=960,h=520;
  c.save(); c.globalAlpha*=alpha; c.translate(870,492+yOff); c.scale(scale,scale); c.rotate(-.008);
  c.shadowColor='rgba(0,0,0,.55)'; c.shadowBlur=36; c.shadowOffsetY=14;
  c.fillStyle='#E8DDC7'; roundRect(c,-w/2,-h/2,w,h,4); c.fill(); c.shadowColor='transparent';
  paperTexture(c,w,h,.9);
  c.strokeStyle='rgba(74,58,39,.18)'; c.lineWidth=1; roundRect(c,-w/2+10,-h/2+10,w-20,h-20,3); c.stroke();

  /* 页眉 */
  const head=clamp((t-20)/.8,0,1);
  c.save(); c.globalAlpha*=head;
  c.fillStyle='rgba(74,58,39,.58)'; c.textAlign='left'; c.textBaseline='top';
  c.font="500 12px 'EB Garamond', serif"; c.fillText('REVUE DE LA FACULTÉ DES SCIENCES DE L’UNIVERSITÉ D’ISTANBUL',-w/2+44,-h/2+35);
  c.strokeStyle='rgba(74,58,39,.22)'; c.beginPath(); c.moveTo(-w/2+44,-h/2+58); c.lineTo(w/2-44,-h/2+58); c.stroke();
  c.restore();

  /* 德文原题：逐行显影 */
  const titleA=clamp((t-23)/.8,0,1);
  c.save(); c.globalAlpha*=titleA;
  c.fillStyle='#3A2E20'; c.textAlign='left'; c.textBaseline='top';
  c.font="900 30px 'EB Garamond', serif";
  c.fillText('Über Aufteilungs- und',-w/2+52,-h/2+94);
  c.fillText('Besetzungs-',-w/2+52,-h/2+132);
  c.fillText('Wahrscheinlichkeiten',-w/2+52,-h/2+170);
  c.fillStyle='rgba(58,46,32,.62)'; c.font="italic 400 15px 'EB Garamond', serif";
  c.fillText('On distribution and occupancy probabilities',-w/2+54,-h/2+214);
  c.strokeStyle='rgba(181,58,47,.55)'; c.lineWidth=2;
  c.beginPath(); c.moveTo(-w/2+52,-h/2+242); c.lineTo(-w/2+330,-h/2+242); c.stroke();
  c.fillStyle='#3A2E20'; c.font="600 19px 'EB Garamond', serif";
  c.fillText('R. von Mises',-w/2+54,-h/2+258);
  c.fillStyle='rgba(74,58,39,.52)'; c.font="400 13px 'EB Garamond', serif";
  c.fillText('Istanbul, 1939',-w/2+54,-h/2+284);
  c.restore();

  /* 右侧迷你 365 格阵：米白纸上用深墨色，不参加辉光 */
  const miniA=clamp((t-24.5)/.9,0,1);
  c.save(); c.globalAlpha*=miniA;
  drawPaperMiniWall(c,t,w/2-350,-h/2+96,10,9,1.5,1.5);
  c.fillStyle='rgba(74,58,39,.62)'; c.font="500 11px 'Noto Sans SC'"; c.textAlign='center'; c.textBaseline='top';
  c.fillText('23 人 · 365 格 · 图为示意',w/2-207,-h/2+270);
  c.restore();

  /* 页脚文献出处 */
  const citeA=clamp((t-32)/.8,0,1);
  c.save(); c.globalAlpha*=citeA;
  c.strokeStyle=rgba('#C9A96A',.65); c.lineWidth=1.4;
  c.beginPath(); c.moveTo(-w/2+52,h/2-84); c.lineTo(w/2-52,h/2-84); c.stroke();
  c.fillStyle='#3A2E20'; c.font="600 15px 'Noto Sans SC'"; c.textAlign='left'; c.textBaseline='top';
  c.fillText('Revue de la Faculté des Sciences de l’Université d’Istanbul',-w/2+52,h/2-70);
  c.fillStyle='rgba(74,58,39,.58)'; c.font="italic 400 13px 'EB Garamond', serif";
  c.fillText('N.S. 4, 145–163 (1939)',-w/2+52,h/2-48);
  c.restore();

  /* 50.7% 金印 */
  if(t>=29){
    const p=easeOut(clamp((t-29)/.5,0,1));
    drawSeal(c,w/2-160,h/2-160,'50.7%',{scale:.78+p*.22,rot:-.10,size:56,alpha:clamp((t-29)/.45,0,1)});
  }
  /* 命名红印 */
  if(t>=35){
    const p=easeOut(clamp((t-35)/.5,0,1));
    drawSeal(c,-w/2+180,h/2-160,'生日问题',{scale:1.02-p*.14,rot:.06,size:36,color:CFG.red,alpha:clamp((t-35)/.45,0,1)});
  }
  c.restore();
}

function drawLiterature(c,t){
  if(t<20 || t>=40) return;
  if(t<37){
    const rise=easeOut(clamp((t-20)/.9,0,1));
    drawLiteraturePage(c,t,rise,1,lerp(120,0,rise));
  } else {
    const k=easeInOut(clamp((t-37)/2.6,0,1));
    drawLiteraturePage(c,t,1-k,lerp(1,.92,k),lerp(0,-30,k));
    /* 迷你格阵推近成整屏 */
    const L={
      x:lerp(1000,470,k), y:lerp(328,150,k),
      cw:lerp(10,42,k), ch:lerp(9,36,k),
      gx:lerp(1.5,5,k), gy:lerp(1.5,5,k)
    };
    drawWall(c,t,{...L,alpha:clamp((t-37)/.8,0,1),litDays:new Set(DAYS),goldDays:new Set([194,222])});
  }
}

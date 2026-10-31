
/* ================= 90–100s 253 对：曲线点变形为 23 个人 ================= */
function nodePos(i,cx,cy,r){
  const a=-Math.PI/2 + i*Math.PI*2/23;
  return {x:cx+Math.cos(a)*r, y:cy+Math.sin(a)*r};
}

function drawNodeGraph(c,t,cx,cy,r,opts={}){
  const edgeCount=opts.edgeCount??253;
  const edgeAlpha=opts.edgeAlpha??1;
  const nodeAlpha=opts.nodeAlpha??1;
  const youMode=opts.youMode||'none'; /* none | highlight | only */
  const positions=opts.positions||PAIRS.map((_,i)=>nodePos(i,cx,cy,r));

  c.save(); c.globalAlpha*=edgeAlpha;
  for(let i=0;i<Math.min(edgeCount,PAIRS.length);i++){
    const [a,b]=PAIRS[i];
    const isYou=(a===YOU||b===YOU);
    if(youMode==='only' && !isYou) continue;
    const pa=nodePosPoint(a,opts), pb=nodePosPoint(b,opts);
    let color, lw, alpha;
    if(youMode==='highlight' && isYou){ color='#B53A2F'; lw=1.7; alpha=.78; }
    else if(youMode==='only'){ color='#B53A2F'; lw=1.4; alpha=.82; }
    else { color='#C9A96A'; lw=.75; alpha=.18; }
    if(opts.pulse && !isYou) alpha=.14+.18*Math.abs(Math.sin(t*1.25+i*.13));
    c.strokeStyle=rgba(color,alpha); c.lineWidth=lw;
    c.beginPath(); c.moveTo(pa.x,pa.y); c.lineTo(pb.x,pb.y); c.stroke();
  }
  c.restore();

  c.save(); c.globalAlpha*=nodeAlpha;
  for(let i=0;i<23;i++){
    const p=opts.positions?opts.positions[i]:nodePos(i,cx,cy,r);
    const you=i===YOU;
    const isGold=you && (youMode!=='none');
    c.shadowColor=isGold?rgba('#C9A96A',.55):'transparent'; c.shadowBlur=isGold?16:0;
    c.fillStyle=isGold?'#C9A96A':'#EDE4D3';
    c.strokeStyle=isGold?rgba('#F1D9A8',.95):rgba('#7FA6C8',.55); c.lineWidth=1.4;
    c.beginPath(); c.arc(p.x,p.y,you&&youMode!=='none'?9:6.5,0,Math.PI*2); c.fill(); c.stroke();
    c.shadowColor='transparent';
  }
  if(opts.labelYou){
    const p=opts.positions?opts.positions[YOU]:nodePos(YOU,cx,cy,r);
    c.fillStyle=CFG.accent; c.font="900 18px 'Noto Serif SC'"; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('你',p.x,p.y-24);
  }
  c.restore();
}

function nodePosPoint(i,opts){
  return opts.positions?opts.positions[i]:nodePos(i,opts.cx||850,opts.cy||380,opts.r||245);
}

function drawNodeStage(c,t){
  if(t<89.8 || t>=100.3) return;
  const fadeOut=1-clamp((t-99.7)/.6,0,1);
  const cx=840, cy=385, r=246;

  /* 90–92.5：曲线上的采样点飞成圆圈 */
  const morph=easeInOut(clamp((t-90)/2.0,0,1));
  const positions=Array.from({length:23},(_,i)=>{
    const n=2+i*3;
    const sx=curveX(n), sy=curveY(prob(n));
    const tx=nodePos(i,cx,cy,r).x, ty=nodePos(i,cx,cy,r).y;
    return {x:lerp(sx,tx,morph), y:lerp(sy,ty,morph)};
  });
  const edgeCount=t<91.2?0:(t>=94.85?253:Math.floor(clamp((t-91.2)/3.65,0,1)*253));
  const youMode=t>=97.4?'highlight':'none';

  c.save(); c.globalAlpha*=fadeOut;
  drawNodeGraph(c,t,cx,cy,r,{positions,edgeCount,youMode,pulse:t>=95,labelYou:t>=97.4});
  c.restore();

  /* 253 计数 */
  if(t>=91.2){
    const a=clamp((t-91.2)/.5,0,1)*fadeOut;
    c.save(); c.globalAlpha=a;
    drawPanel(c,1470,184,338,220,{stroke:'rgba(201,169,106,.20)'});
    c.textAlign='left'; c.textBaseline='top';
    c.fillStyle='rgba(138,138,160,.8)'; c.font="500 13px 'Noto Sans SC'";
    c.fillText('两两配对 · C(23,2)',1492,205);
    c.fillStyle=CFG.accent; c.font="900 72px 'Noto Serif SC'";
    c.fillText(String(edgeCount),1490,232);
    c.fillStyle='rgba(138,138,160,.75)'; c.font="500 15px 'Noto Sans SC'";
    c.fillText('对',1490+ (edgeCount>99?146:92),300);
    c.fillStyle='rgba(138,138,160,.56)'; c.font="500 12px 'Noto Sans SC'";
    c.fillText('23 个人 · 不是 23 次比较',1492,346);
    c.restore();
  }

  if(t>=95 && t<97.5){
    const a=clamp((t-95)/.4,0,1)*fadeOut;
    c.save(); c.globalAlpha=a;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle='rgba(138,138,160,.75)'; c.font="500 14px 'Noto Sans SC'";
    c.fillText('每对 1/365　·　253/365 ≈ 69.3%（粗略上界，忽略重叠）',960,720);
    c.restore();
    /* 边上只闪一次极小的 1/365 */
    const pairsToShow=12;
    for(let k=0;k<pairsToShow;k++){
      const [a0,b0]=PAIRS[(k*21+7)%PAIRS.length];
      if(a0===YOU||b0===YOU) continue;
      const p=nodePos(a0,cx,cy,r), q=nodePos(b0,cx,cy,r);
      const x=(p.x+q.x)/2, y=(p.y+q.y)/2;
      const al=.22+.34*Math.abs(Math.sin(t*2.1+k*.9));
      c.save(); c.globalAlpha=al*a; c.fillStyle=rgba('#C9A96A',.9); c.font="500 10px 'EB Garamond', serif";
      c.textAlign='center'; c.textBaseline='middle'; c.fillText('1/365',x,y); c.restore();
    }
  }

  if(t>=97.5){
    const a=clamp((t-97.5)/.4,0,1)*fadeOut;
    c.save(); c.globalAlpha=a;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle='rgba(181,58,47,.88)'; c.font="700 16px 'Noto Sans SC'";
    c.fillText('你 · 22 条红边',600,724);
    c.fillStyle='rgba(201,169,106,.82)'; c.font="500 15px 'Noto Sans SC'";
    c.fillText('其余 231 条金边',1290,724);
    c.restore();
  }
}

/* ================= 100–110s 两个问题 + 253 = 22 + 231 ================= */
function drawMiniNet(c,cx,cy,r,t,opt={}){
  const alpha=opt.alpha??1;
  c.save(); c.globalAlpha*=alpha;
  const youEdges=PAIRS.filter(([a,b])=>a===YOU||b===YOU);
  const edges=opt.onlyYou?youEdges:PAIRS;
  const prog=opt.edgeProgress??1;
  const nShow=Math.floor(edges.length*prog);
  for(let i=0;i<nShow;i++){
    const [a,b]=edges[i];
    const isYou=(a===YOU||b===YOU);
    const p=nodePos(a,cx,cy,r), q=nodePos(b,cx,cy,r);
    const red=opt.onlyYou && isYou;
    const color=red?'#B53A2F':'#C9A96A';
    const lw=red?1.8:.68;
    const goldA=(opt.goldAlpha??.20);
    let al=red?.82:goldA;
    if(opt.pulse) al=red?.82:(goldA*.72+.14*Math.abs(Math.sin(t*1.3+i*.1)));
    c.strokeStyle=rgba(color,al); c.lineWidth=lw;
    c.beginPath(); c.moveTo(p.x,p.y); c.lineTo(q.x,q.y); c.stroke();
  }
  for(let i=0;i<23;i++){
    const p=nodePos(i,cx,cy,r);
    const isYou=i===YOU && opt.onlyYou;
    c.fillStyle=isYou?'#B53A2F':'#EDE4D3';
    c.strokeStyle=isYou?rgba('#F1D9A8',.9):rgba('#7FA6C8',.52); c.lineWidth=1.1;
    c.beginPath(); c.arc(p.x,p.y,isYou?7:4.8,0,Math.PI*2); c.fill(); c.stroke();
  }
  if(opt.onlyYou){
    const p=nodePos(YOU,cx,cy,r);
    c.fillStyle='rgba(181,58,47,.9)'; c.font="900 14px 'Noto Serif SC'"; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('你',p.x,p.y-18);
  }
  c.restore();
}

function drawComparisonStage(c,t){
  if(t<99.8 || t>=110.5) return;
  const out=1-clamp((t-109.4)/.62,0,1);
  const graphsA=out*(1-clamp((t-107.4)/.55,0,1));
  const leftA=.92*((t>=102.5)?0.40:1);
  const rightA=1;
  c.save(); c.globalAlpha*=graphsA;

  /* 左：和我同一天 / 22 条红边 */
  c.save(); c.globalAlpha*=leftA;
  c.textAlign='center'; c.textBaseline='middle';
  c.fillStyle=t>=102.5?'rgba(138,138,160,.55)':'rgba(234,234,242,.92)';
  c.font="700 27px 'Noto Sans SC'";
  c.fillText('和我同一天',500,160);
  c.fillStyle='rgba(138,138,160,.62)'; c.font="500 13px 'Noto Sans SC'";
  c.fillText('SAME AS ME · 22 对',500,188);
  drawMiniNet(c,500,380,162,t,{onlyYou:true,edgeProgress:1,alpha:1});
  c.fillStyle='rgba(181,58,47,.9)'; c.font="900 48px 'Noto Serif SC'";
  c.fillText('5.9%',500,602);
  c.fillStyle='rgba(138,138,160,.72)'; c.font="500 14px 'Noto Sans SC'";
  c.fillText('22 对 · 只算你自己',500,642);
  c.restore();

  /* 右：任意两个人 / 253 条金边 */
  c.save(); c.globalAlpha*=rightA;
  c.textAlign='center'; c.textBaseline='middle';
  c.fillStyle=t>=102.5?CFG.ink:'rgba(234,234,242,.92)';
  c.font="700 27px 'Noto Sans SC'";
  c.fillText('任意两个人',1340,160);
  c.fillStyle=t>=102.5?rgba('#C9A96A',.9):'rgba(138,138,160,.62)'; c.font="500 13px 'Noto Sans SC'";
  c.fillText('ANY TWO · 253 对',1340,188);
  drawMiniNet(c,1340,380,162,t,{onlyYou:false,edgeProgress:1,pulse:t>=102.5,alpha:1,goldAlpha:.24});
  c.fillStyle=CFG.accent; c.font="900 48px 'Noto Serif SC'";
  c.fillText('50.7%',1340,602);
  c.fillStyle='rgba(138,138,160,.72)'; c.font="500 14px 'Noto Sans SC'";
  c.fillText('253 对 · 题目问的是这个',1340,642);
  c.restore();

  c.restore();

  /* 105–107.5：主语换了，答案从 5.9% 跨到 50.7% */
  if(t>=105 && t<107.5){
    const a=clamp((t-105)/.4,0,1);
    c.save(); c.globalAlpha*=a*out;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle='rgba(138,138,160,.68)'; c.font="500 15px 'Noto Sans SC'";
    c.fillText('同一间房，换一个主语',960,682);
    c.fillStyle='rgba(181,58,47,.9)'; c.font="900 34px 'Noto Serif SC'";
    c.fillText('5.9%',790,720);
    c.fillStyle='rgba(138,138,160,.7)'; c.font="900 26px 'Noto Sans SC'";
    c.fillText('→',960,720);
    c.fillStyle=CFG.accent; c.font="900 34px 'Noto Serif SC'";
    c.fillText('50.7%',1130,720);
    c.restore();
  }

  /* 107.5–110：253 = 22 + 231 */
  if(t>=107.5){
    const a=clamp((t-107.5)/.55,0,1);
    c.save(); c.globalAlpha*=a*out;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle=CFG.accent; c.font="900 76px 'Noto Serif SC'";
    c.fillText('253',480,300);
    c.fillStyle='rgba(138,138,160,.75)'; c.font="500 52px 'Noto Serif SC'";
    c.fillText('=',620,300);
    c.fillStyle=CFG.red; c.font="900 64px 'Noto Serif SC'";
    c.fillText('22',735,300);
    c.fillStyle='rgba(138,138,160,.75)'; c.font="500 52px 'Noto Serif SC'";
    c.fillText('+',845,300);
    c.fillStyle=CFG.accent; c.font="900 76px 'Noto Serif SC'";
    c.fillText('231',990,300);
    c.fillStyle='rgba(138,138,160,.75)'; c.font="500 16px 'Noto Sans SC'";
    c.fillText('你数了 22 对，漏了 231 对',960,380);

    /* 253 格长条：22 红 + 231 金 */
    const x0=276,y0=470,w=1368,h=48;
    roundRect(c,x0,y0,w,h,6); c.fillStyle='rgba(20,21,40,.8)'; c.fill(); c.strokeStyle='rgba(201,169,106,.18)'; c.stroke();
    const redW=w*22/253;
    roundRect(c,x0,y0,redW,h,4); c.fillStyle=rgba('#B53A2F',.85); c.fill();
    roundRect(c,x0+redW+3,y0,w-redW-3,h,4); c.fillStyle=rgba('#C9A96A',.55); c.fill();
    c.fillStyle='rgba(234,234,242,.8)'; c.font="500 13px 'Noto Sans SC'"; c.textAlign='left'; c.textBaseline='top';
    c.fillText('22 红',x0+3,y0+h+13);
    c.fillStyle='rgba(201,169,106,.8)'; c.textAlign='right';
    c.fillText('231 金',x0+w,y0+h+13);
    c.strokeStyle=rgba('#C9A96A',.5); c.lineWidth=1.1;
    c.beginPath(); c.moveTo(x0+redW,y0-10); c.lineTo(x0+redW,y0+h+3); c.stroke();
    c.fillStyle='rgba(234,234,242,.9)'; c.font="700 19px 'Noto Sans SC'"; c.textAlign='center'; c.textBaseline='top';
    c.fillText('漏掉的是 231 对',960,y0+h+46);
    c.restore();
  }
}

/* ================= 110–120s 教室 · 群聊 · 婚礼 ================= */
function drawThreeScenes(c,t){
  if(t<110.0 || t>=120.2) return;
  const cardA=clamp((t-110.0)/.6,0,1)*(1-clamp((t-117.2)/.7,0,1));
  if(cardA>0){
    const centers=[430,960,1490];
    const labels=[['教室','CLASSROOM'],['群聊','GROUP CHAT'],['婚礼','A WEDDING']];
    centers.forEach((cx,i)=>{
      c.save(); c.globalAlpha*=cardA;
      const y=238;
      drawPanel(c,cx-188,y,376,360,{fill:'rgba(13,14,32,.88)',stroke:'rgba(201,169,106,.22)'});
      c.textAlign='center'; c.textBaseline='top';
      c.fillStyle=CFG.ink; c.font="700 23px 'Noto Sans SC'";
      c.fillText(labels[i][0],cx,y+18);
      c.fillStyle='rgba(138,138,160,.58)'; c.font="500 11px 'Noto Sans SC'";
      c.fillText(labels[i][1],cx,y+47);
      drawMiniNet(c,cx,y+178,95,t,{onlyYou:false,edgeProgress:clamp((t-112.5)/1.2,0,1),pulse:true,alpha:1,goldAlpha:.30});
      c.fillStyle=CFG.accent; c.font="900 22px 'Noto Serif SC'";
      c.fillText('50.7%',cx,y+308);
      c.fillStyle='rgba(138,138,160,.62)'; c.font="500 11px 'Noto Sans SC'";
      c.fillText('23 人 · 253 对',cx,y+336);
      c.restore();
    });
  }

  /* 117.5–120：三张卡合成一张群聊卡 */
  if(t>=117.3){
    const a=clamp((t-117.3)/.7,0,1);
    c.save(); c.globalAlpha*=a;
    drawPanel(c,530,150,860,520,{fill:'rgba(12,13,30,.94)',stroke:'rgba(201,169,106,.28)'});
    c.textAlign='left'; c.textBaseline='middle';
    c.fillStyle='rgba(234,234,242,.8)'; c.font="500 17px 'Noto Sans SC'";
    c.fillText('相亲相爱一家人（23）',566,186);
    c.fillStyle='rgba(138,138,160,.55)'; c.font="500 12px 'Noto Sans SC'";
    c.fillText('GROUP CHAT · 23 MEMBERS',566,210);
    c.strokeStyle='rgba(201,169,106,.16)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(530,232); c.lineTo(1390,232); c.stroke();

    /* 气泡 */
    const bubbles=[
      [596,286,300,'有人今天生日吗？',''],
      [920,338,340,'我也是 5 月 14 号。',''],
      [610,402,470,'我们俩同一天生日！','gold'],
    ];
    bubbles.forEach(([bx,by,bw,txt,type],i)=>{
      roundRect(c,bx,by,bw,64,14);
      c.fillStyle=type==='gold'?rgba('#C9A96A',.16):'rgba(127,166,200,.08)';
      c.fill(); c.strokeStyle=type==='gold'?rgba('#C9A96A',.72):'rgba(127,166,200,.22)'; c.lineWidth=1.2; c.stroke();
      c.fillStyle=type==='gold'?CFG.accent:'rgba(234,234,242,.86)'; c.font="600 21px 'Noto Sans SC'";
      c.fillText(txt,bx+24,by+33);
      if(type==='gold'){
        c.fillStyle='rgba(138,138,160,.55)'; c.font="500 12px 'Noto Sans SC'";
        c.fillText('23 人里，任意两人的概率：50.7%',bx+24,by+84);
      }
    });
    c.textAlign='center'; c.fillStyle='rgba(138,138,160,.55)'; c.font="500 13px 'Noto Sans SC'";
    c.fillText('你上周也见过',960,622);
    c.restore();
  }
}

/* ================= 120–124.5s 末句：回到开场那面墙 ================= */
function drawOutro(c,t){
  if(t<120 || t>=124.5) return;
  const a=clamp((t-120)/1.0,0,1);
  c.save(); c.globalAlpha*=a*.22;
  drawWall(c,t,{x:430,y:142,cw:40,ch:34,gx:5,gy:5,alpha:1,goldDays:new Set([194,222])});
  c.restore();
  const c1=wallCell({x:430,y:142,cw:40,ch:34,gx:5,gy:5},194);
  const c2=wallCell({x:430,y:142,cw:40,ch:34,gx:5,gy:5},222);
  drawCollisionGlow(c,c1.x+20,c1.y+17,t,1.2,.55*a);
  drawCollisionGlow(c,c2.x+20,c2.y+17,t,1.2,.55*a);

  if(t>=121.8){
    const k=easeOut(clamp((t-121.8)/.8,0,1));
    c.save(); c.globalAlpha*=clamp((t-121.8)/.6,0,1);
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle=rgba('#C9A96A',.22); c.font="900 170px 'Noto Serif SC'";
    c.fillText('同一天',960,395);
    c.fillStyle=rgba('#C9A96A',.82); c.font="900 47px 'Noto Serif SC'";
    c.fillText('《同一天》',960,570);
    c.fillStyle='rgba(138,138,160,.72)'; c.font="italic 400 18px 'EB Garamond', serif";
    c.fillText('The Day We Share',960,614);
    c.restore();
  }
}

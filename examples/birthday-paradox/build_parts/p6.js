
/* ================= 场景总调度 ================= */
function drawScene(t){
  NOW=t;
  ctScene.clearRect(0,0,1920,1080);

  if(t<13.2){
    if(t<3.9){
      const a=1-clamp((t-3.0)/.65,0,1);
      if(a>0) drawClassroom(ctScene,t,a);
    }
    if(t>=3.0 && t<8.7) drawHookWall(ctScene,t,1-clamp((t-7.9)/.8,0,1));
    if(t>=8.0) drawComparison(ctScene,t);
  }

  if(t>=20 && t<40) drawLiterature(ctScene,t);
  if(t>=40 && t<47.5) drawRuleStage(ctScene,t);
  if(t>=47.5 && t<63.5) drawFirstTrial(ctScene,t);
  if(t>=63.5 && t<73) drawThousand(ctScene,t);
  if(t>=72 && t<84) drawSixNumbers(ctScene,t);
  if(t>=82 && t<90.5) drawCurveChart(ctScene,t);
  if(t>=89.8 && t<100.3) drawNodeStage(ctScene,t);
  if(t>=99.8 && t<110.5) drawComparisonStage(ctScene,t);
  if(t>=110.0 && t<120.2) drawThreeScenes(ctScene,t);
  if(t>=120 && t<124.5) drawOutro(ctScene,t);
}

/* ================= DOM 覆盖层：章节、注释、双语字幕 ================= */
const $ = id => document.getElementById(id);
const elTop=$('toplabel'), elAnn=$('annotation'), elSub=$('subtitle'), elSubEn=$('subtitle-en');
const elTitle=$('titlecard'), elEnd=$('endcard');
const titleSeries=elTitle.querySelector('.series');
const titleName=elTitle.querySelector('.name');
const titleQ=elTitle.querySelector('.q');
const titleQEn=elTitle.querySelector('.q-en');

function sectionAt(t){
  let sec=SECTIONS[0];
  for(const s of SECTIONS) if(t>=s[0]) sec=s;
  return sec;
}

function drawOverlay(t){
  const tcIn = t>=TITLE_CARD[0] && t<TITLE_CARD[1];
  const endIn = t>=124.5;
  const sec=sectionAt(t);

  elTop.textContent = sec[1] || CFG.topic;
  elTop.style.opacity = tcIn||endIn?0:.78;
  elAnn.textContent = sec[2] || '';
  elAnn.style.opacity = tcIn||endIn?0:.78;

  const sub=SUBTITLES.find(([a,b])=>t>=a&&t<b);
  if(sub && !tcIn && !endIn){
    const [a,b,zh,en]=sub;
    const kin=easeOut(clamp((t-a)/.38,0,1));
    const kout=1-easeInOut(clamp((t-(b-.34))/.34,0,1));
    const k=kin*kout;
    elSub.innerHTML=zh;
    elSubEn.textContent=en||'';
    elSub.style.opacity=k;
    elSubEn.style.opacity=k*.92;
    elSub.style.transform=`translateY(${lerp(8,0,kin)}px)`;
    elSubEn.style.transform=`translateY(${lerp(6,0,kin)}px)`;
  } else {
    elSub.innerHTML=''; elSubEn.textContent='';
  }

  if(tcIn){
    elTitle.style.display='flex';
    const aIn=easeOut(clamp((t-TITLE_CARD[0])/.7,0,1));
    const aOut=1-clamp((t-(TITLE_CARD[1]-.55))/.55,0,1);
    elTitle.style.opacity=aIn*aOut;
    titleSeries.style.opacity=clamp((t-13.2)/.6,0,1);
    titleName.style.opacity=clamp((t-13.5)/.7,0,1);
    titleName.style.transform=`scale(${lerp(.93,1,easeOut(clamp((t-13.5)/1.0,0,1)))})`;
    titleQ.style.opacity=clamp((t-14.1)/.7,0,1);
    titleQEn.style.opacity=clamp((t-14.6)/.7,0,1)*.85;
  } else {
    elTitle.style.display='none';
  }

  if(endIn){
    elEnd.style.display='flex';
    elEnd.style.opacity=easeOut(clamp((t-124.5)/.8,0,1));
  } else {
    elEnd.style.display='none';
  }
}

/* ================= 帧入口 ================= */
window.render = function(t){
  t=clamp(t,0,CFG.duration-.001);
  drawBG(t);
  drawScene(t);
  drawOverlay(t);
};

/* 浏览器实时预览用；渲染器设 __RENDER_MODE__=true 后必须停止 */
let __t0=performance.now();
(function loop(){
  if(window.__RENDER_MODE__) return;
  window.render((performance.now()-__t0)/1000);
  requestAnimationFrame(loop);
})();

/* 便于验收：关键数值自检 */
window.selftest = function(){
  const checks=[
    {name:'P(23)=50.7%', ok:Math.abs(prob(23)-0.5072972343239857)<1e-12, got:prob(23), want:0.5072972343239857},
    {name:'P(22)=47.6%', ok:Math.abs(prob(22)-0.4756953076625503)<1e-12, got:prob(22), want:0.4756953076625503},
    {name:'模拟命中 510', ok:SIM.count===510 && SIM_PREFIX[1000]===510, got:SIM_PREFIX[1000], want:510},
    {name:'C(23,2)=253', ok:PAIRS.length===253, got:PAIRS.length, want:253},
  ];
  return checks;
};
</script>
</body>
</html>

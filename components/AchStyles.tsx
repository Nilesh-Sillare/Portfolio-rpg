const css = `
@keyframes achRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes achPulse{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes achGrow{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
@keyframes achSpin{to{transform:rotate(360deg)}}
@keyframes achRipple{0%{transform:scale(1);opacity:.6}100%{transform:scale(2);opacity:0}}
@keyframes achFade{from{opacity:0;transform:translateX(6px)}to{opacity:1;transform:none}}
@keyframes achDraw{from{stroke-dashoffset:264}}
@keyframes achBreathe{0%,100%{box-shadow:0 0 6px var(--c),inset 0 0 6px var(--c)}50%{box-shadow:0 0 20px var(--c),inset 0 0 11px var(--c)}}
@keyframes achTwinkle{0%,100%{opacity:0;transform:scale(.3) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}
@keyframes achReady{0%,100%{opacity:.7;box-shadow:0 0 0 transparent}50%{opacity:1;box-shadow:0 0 11px var(--c)}}
@keyframes achWhite{0%,100%{box-shadow:0 0 6px rgba(255,255,255,.3)}50%{box-shadow:0 0 17px rgba(255,255,255,.75)}}
.ach-rise{opacity:0;animation:achRise .7s ease forwards}
.ach-pulse{animation:achPulse 3.2s ease-in-out infinite}
.ach-grow{animation:achGrow .6s cubic-bezier(.2,.9,.3,1.2) both}
.ach-spin{animation:achSpin 16s linear infinite}
.ach-spin-fast{animation:achSpin 5s linear infinite}
.ach-ripple{animation:achRipple 2.8s ease-out infinite}
.ach-fade{animation:achFade .35s ease both}
.ach-draw{animation:achDraw .9s ease both}
.ach-breathe{animation:achBreathe 3.4s ease-in-out infinite}
.ach-twinkle{animation:achTwinkle 2.6s ease-in-out infinite}
.ach-ready{animation:achReady 2.4s ease-in-out infinite}
.ach-white{animation:achWhite 2s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){
  .ach-rise,.ach-grow,.ach-fade{opacity:1;animation:none}
  .ach-pulse,.ach-spin,.ach-spin-fast,.ach-ripple,.ach-draw,.ach-breathe,.ach-twinkle,.ach-ready,.ach-white{animation:none}
}
`;
export default function AchStyles() {
  return <style>{css}</style>;
}
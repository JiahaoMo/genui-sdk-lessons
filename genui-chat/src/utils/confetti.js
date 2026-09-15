/**
 * 在页面上真的撒一把彩带。
 *
 * @param {string} message 祝福语，会在屏幕中央显示。由模型决定内容，工具参数传进来。
 * @param {number} count 彩带片数
 */
export function confetti(message = '', count = 60) {
  if (message) showMessage(message);

  for (let i = 0; i < count; i++) {
    const size = 6 + Math.random() * 6;
    const duration = 2 + Math.random() * 2; // 每片落下的时间不一样，才像撒的
    const el = document.createElement('i');
    Object.assign(el.style, {
      position: 'fixed',
      top: '-5vh',
      left: `${Math.random() * 100}vw`,
      width: `${size}px`,
      height: `${size * 1.6}px`,
      background: `hsl(${Math.random() * 360} 90% 62%)`,
      borderRadius: '1px',
      zIndex: 99999,
      pointerEvents: 'none', // 别挡住用户点按钮
      transition: `top ${duration}s ease-in, transform ${duration}s ease-in, opacity 1s ${duration - 0.5}s`,
    });
    document.body.appendChild(el);
    el.getBoundingClientRect(); // 强制重排，让起始位置先生效，否则不会有过渡
    requestAnimationFrame(() => {
      el.style.top = '105vh';
      el.style.transform = `rotate(${Math.random() * 1440 - 720}deg)`;
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), (duration + 2) * 1000);
  }
}

/**
 * 在屏幕中央弹一句祝福语：从小放大弹出来，停一会儿，边淡出边上飘。
 */
function showMessage(text) {
  const el = document.createElement('div');
  el.textContent = text;
  Object.assign(el.style, {
    position: 'fixed',
    top: '38%',
    left: '50%',
    transform: 'translate(-50%, -50%) scale(0.7)',
    fontSize: '38px',
    fontWeight: '700',
    lineHeight: '1.3',
    textAlign: 'center',
    maxWidth: '80vw',
    color: '#fff',
    textShadow: '0 2px 12px rgba(0,0,0,.45), 0 0 44px rgba(255,205,60,.85)',
    zIndex: 100000,
    pointerEvents: 'none', // 别挡住用户点按钮
    opacity: '0',
    transition: 'opacity .45s ease, transform .7s cubic-bezier(.2, 1.6, .4, 1)',
  });
  document.body.appendChild(el);
  el.getBoundingClientRect(); // 同样先强制重排，让起始状态生效

  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, -50%) scale(1)';
  });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%, -75%) scale(1.06)'; // 淡出时往上飘
  }, 2600);
  setTimeout(() => el.remove(), 3600);
}

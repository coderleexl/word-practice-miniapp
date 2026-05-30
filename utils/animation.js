/**
 * 动效工具
 * 提供粒子撒花、卡片震动、XP飞入等动效
 * 使用 wx.createAnimation 和 Canvas
 */

/**
 * 创建撒花粒子效果
 * 需要在页面中放置一个全屏 canvas: <canvas canvas-id="confetti" class="confetti-canvas"/>
 */
function fireConfetti(canvasId) {
  var query = wx.createSelectorQuery();
  query.select('.confetti-canvas').fields({ node: true, size: true }).exec(function (res) {
    if (!res || !res[0] || !res[0].node) return;
    var canvas = res[0].node;
    var ctx = canvas.getContext('2d');
    var width = res[0].width;
    var height = res[0].height;
    var dpr = wx.getSystemInfoSync().pixelRatio || 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    var colors = ['#58CC02', '#1CB0F6', '#FFC800', '#FF4B4B', '#CE82FF', '#FF86D0'];
    var particles = [];
    var count = 60;

    for (var i = 0; i < count; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * width * 0.6,
        y: height * 0.3,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 10 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        life: 1,
        decay: 0.008 + Math.random() * 0.008
      });
    }

    var frame = 0;
    var maxFrames = 90;

    function animate() {
      if (frame >= maxFrames) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        p.x += p.vx;
        p.vy += 0.3;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life -= p.decay;

        if (p.life <= 0) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      frame++;
      requestAnimationFrame(animate);
    }

    animate();
  });
}

/**
 * 简化版撒花（不依赖 Canvas node，用 CSS 动画模拟）
 * 在页面中放置多个小色块，用 animation 执行
 */
function fireConfettiCSS(page) {
  var colors = ['#58CC02', '#1CB0F6', '#FFC800', '#FF4B4B', '#CE82FF'];
  var particles = [];
  for (var i = 0; i < 20; i++) {
    particles.push({
      id: 'p' + i,
      left: Math.random() * 600 + 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 200,
      size: Math.random() * 16 + 8
    });
  }
  page.setData({ confettiParticles: particles });
  setTimeout(function () {
    page.setData({ confettiParticles: [] });
  }, 1200);
}

/**
 * XP 飞入动画
 * 在页面右上角显示 "+N XP" 然后向上飘走
 */
function floatXP(page, amount) {
  page.setData({
    floatingXP: amount,
    showFloatingXP: true
  });
  setTimeout(function () {
    page.setData({ showFloatingXP: false });
  }, 1200);
}

/**
 * 微信震动反馈
 */
function vibrateLight() {
  wx.vibrateShort({ type: 'light' });
}

function vibrateMedium() {
  wx.vibrateShort({ type: 'medium' });
}

function vibrateError() {
  wx.vibrateShort({ type: 'heavy' });
}

module.exports = {
  fireConfetti: fireConfetti,
  fireConfettiCSS: fireConfettiCSS,
  floatXP: floatXP,
  vibrateLight: vibrateLight,
  vibrateMedium: vibrateMedium,
  vibrateError: vibrateError
};

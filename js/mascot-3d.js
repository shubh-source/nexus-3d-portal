/**
 * NEXUS 3D // Interactive 3D Security Mascot "Orb-E"
 * Tracks cursor, covers eyes during password entry, peeks when toggled,
 * shakes head on errors, and celebrates on success.
 */

// Canvas 2D roundRect polyfill for legacy browser compatibility
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    if (!Array.isArray(radii)) radii = [radii || 0];
    const r = radii[0] || 0;
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };
}

class Mascot3DController {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Bubble element
    this.bubble = document.getElementById('mascot-bubble');
    this.bubbleText = this.bubble ? this.bubble.querySelector('span') : null;

    // Dimensions
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2 + 10;

    // Mascot State
    // 'idle' | 'email' | 'password' | 'peek' | 'error' | 'success'
    this.state = 'idle';
    
    // Kinematics & Orientation
    this.lookX = 0; // -1 to 1
    this.lookY = 0; // -1 to 1
    this.targetLookX = 0;
    this.targetLookY = 0;

    // Body Motion
    this.floatOffset = 0;
    this.floatSpeed = 0.04;
    this.time = 0;

    // Hands Animation Progress (0 = down at sides, 1 = covering eyes)
    this.handsCoverProgress = 0;
    this.targetHandsCover = 0;
    this.peekProgress = 0; // 0 = both covering, 1 = right hand lowered

    // Blinking & Expressions
    this.eyeScaleY = 1;
    this.blinkTimer = 0;
    this.nextBlink = 120;
    this.shakeTimer = 0;
    this.shakeOffset = 0;
    this.bounceProgress = 0;

    // Theme color (Default: Cosmic Cyan)
    this.accentColor = '#00dfd8';
    this.secondaryColor = '#7928ca';

    this.initEvents();
    this.animate();
  }

  setTheme(accent, secondary) {
    this.accentColor = accent;
    this.secondaryColor = secondary;
  }

  say(message, duration = 3000) {
    if (!this.bubble || !this.bubbleText) return;
    this.bubbleText.textContent = message;
    this.bubble.classList.add('visible');

    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
    this.bubbleTimeout = setTimeout(() => {
      this.bubble.classList.remove('visible');
    }, duration);
  }

  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;

    switch (newState) {
      case 'idle':
        this.targetHandsCover = 0;
        this.peekProgress = 0;
        break;
      case 'email':
        this.targetHandsCover = 0;
        this.peekProgress = 0;
        this.say('Scanning frequency...');
        break;
      case 'password':
        this.targetHandsCover = 1;
        this.peekProgress = 0;
        this.say("I'm not looking! 🙈");
        break;
      case 'peek':
        this.targetHandsCover = 1;
        this.peekProgress = 1;
        this.say('Just a peek! 👀');
        break;
      case 'error':
        this.shakeTimer = 30;
        this.targetHandsCover = 0;
        this.say('Credentials mismatch!');
        break;
      case 'success':
        this.bounceProgress = 1;
        this.targetHandsCover = 0;
        this.say('Authentication Approved! 🎉');
        break;
    }
  }

  initEvents() {
    window.addEventListener('mousemove', (e) => {
      // Calculate normalized direction towards mouse from center of screen
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2 - 100;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);

      this.targetLookX = Math.max(-1, Math.min(1, dx));
      this.targetLookY = Math.max(-0.8, Math.min(0.8, dy));
    });

    // Device orientation support for mobile
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null) {
        this.targetLookX = Math.max(-1, Math.min(1, e.gamma / 30));
        this.targetLookY = Math.max(-0.8, Math.min(0.8, (e.beta - 45) / 30));
      }
    });
  }

  update() {
    this.time += 1;

    // Smooth head look lerp
    this.lookX += (this.targetLookX - this.lookX) * 0.1;
    this.lookY += (this.targetLookY - this.lookY) * 0.1;

    // Idle floating bob
    this.floatOffset = Math.sin(this.time * this.floatSpeed) * 6;

    // Hands covering interpolation
    this.handsCoverProgress += (this.targetHandsCover - this.handsCoverProgress) * 0.15;

    // Blinking
    this.blinkTimer++;
    if (this.blinkTimer > this.nextBlink) {
      this.eyeScaleY = 0.1;
      if (this.blinkTimer > this.nextBlink + 8) {
        this.eyeScaleY = 1;
        this.blinkTimer = 0;
        this.nextBlink = 90 + Math.random() * 140;
      }
    }

    // Error Head Shake
    if (this.shakeTimer > 0) {
      this.shakeTimer--;
      this.shakeOffset = Math.sin(this.shakeTimer * 0.8) * (this.shakeTimer * 0.4);
    } else {
      this.shakeOffset = 0;
    }

    // Success Bounce
    if (this.bounceProgress > 0) {
      this.bounceProgress -= 0.03;
      if (this.bounceProgress < 0) this.bounceProgress = 0;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();

    // Overall Mascot Center with floating & bounce
    const bounceY = Math.sin(this.bounceProgress * Math.PI) * 25;
    const bodyX = this.centerX + this.shakeOffset;
    const bodyY = this.centerY + this.floatOffset - bounceY;

    // 1. Shadow underneath
    ctx.beginPath();
    const shadowScale = 1 - (this.floatOffset / 30);
    ctx.ellipse(this.centerX, this.height - 18, 38 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // 2. Head Tilt & Rotation Projection
    ctx.translate(bodyX, bodyY);
    ctx.rotate((this.lookX * 0.15) + (this.shakeOffset * 0.05));

    // 3. Antenna with Glowing Pulse Tip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(this.lookX * 4, -58);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Antenna Orb
    const pulse = Math.sin(this.time * 0.1) * 2;
    ctx.beginPath();
    ctx.arc(this.lookX * 4, -58, 6 + pulse * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = this.accentColor;
    ctx.shadowColor = this.accentColor;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();

    // 4. Main Spherical Head / Chassis (3D Gradient Shading)
    const headRadius = 40;
    const headGrad = ctx.createRadialGradient(
      -12 + this.lookX * 10,
      -15 + this.lookY * 10,
      4,
      0,
      0,
      headRadius
    );
    headGrad.addColorStop(0, '#ffffff');
    headGrad.addColorStop(0.3, '#cbd5e1');
    headGrad.addColorStop(0.8, '#475569');
    headGrad.addColorStop(1, '#0f172a');

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = headGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 10;
    ctx.fill();
    ctx.restore();

    // Outer decorative metallic halo/ears
    [-headRadius - 4, headRadius + 4].forEach((earX, i) => {
      ctx.beginPath();
      ctx.arc(earX, this.lookY * 4, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = this.accentColor;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });

    // 5. Visor (Dark curved faceplate with neon edge)
    const visorX = this.lookX * 14;
    const visorY = -2 + this.lookY * 12;
    const visorW = 54;
    const visorH = 26;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(visorX - visorW / 2, visorY - visorH / 2, visorW, visorH, 12);
    ctx.fillStyle = '#05070d';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    // Visor Glass Reflection Highlight
    ctx.beginPath();
    ctx.ellipse(visorX - 8, visorY - 5, 12, 4, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fill();

    // 6. Digital Neon Eyes / Expressions
    this.drawVisorFace(ctx, visorX, visorY);
    ctx.restore();

    // 7. 3D Robotic Hands (Cover eyes when entering password)
    this.drawHands(ctx, bodyX, bodyY, visorX, visorY);

    ctx.restore();
  }

  drawVisorFace(ctx, vx, vy) {
    ctx.save();
    ctx.shadowColor = this.accentColor;
    ctx.shadowBlur = 10;

    if (this.state === 'error') {
      // Angry / Distressed Red X Eyes
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 3;
      [-12, 12].forEach((offset) => {
        const ex = vx + offset;
        ctx.beginPath();
        ctx.moveTo(ex - 4, vy - 4);
        ctx.lineTo(ex + 4, vy + 4);
        ctx.moveTo(ex + 4, vy - 4);
        ctx.lineTo(ex - 4, vy + 4);
        ctx.stroke();
      });
    } else if (this.state === 'success') {
      // Happy Smiling Curved Eyes (^ ^)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      [-12, 12].forEach((offset) => {
        const ex = vx + offset;
        ctx.beginPath();
        ctx.arc(ex, vy + 2, 6, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      });
    } else if (this.state === 'email') {
      // Tech Scanlines in eyes
      ctx.fillStyle = this.accentColor;
      [-12, 12].forEach((offset) => {
        const ex = vx + offset;
        ctx.beginPath();
        ctx.ellipse(ex, vy, 6, 6 * this.eyeScaleY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal scan line
        const scanY = vy + Math.sin(this.time * 0.2) * 4;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ex - 5, scanY);
        ctx.lineTo(ex + 5, scanY);
        ctx.stroke();
      });
    } else {
      // Standard Expressive Glowing Ovals
      ctx.fillStyle = this.accentColor;
      [-12, 12].forEach((offset) => {
        const ex = vx + offset;
        ctx.beginPath();
        ctx.ellipse(ex, vy, 6.5, 7.5 * this.eyeScaleY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner pupil highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex + this.lookX * 1.5, vy + this.lookY * 1.5 - 1, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.accentColor;
      });
    }

    ctx.restore();
  }

  drawHands(ctx, bodyX, bodyY, visorX, visorY) {
    if (this.handsCoverProgress <= 0.01) return;

    ctx.save();
    const p = this.handsCoverProgress;

    // Left Hand
    const leftRestX = -46;
    const leftRestY = 22;
    const leftCoverX = visorX - 12;
    const leftCoverY = visorY + 2;

    const curLeftX = leftRestX + (leftCoverX - leftRestX) * p;
    const curLeftY = leftRestY + (leftCoverY - leftRestY) * p;

    this.drawSingleHand(ctx, curLeftX, curLeftY, -1);

    // Right Hand (can peek if peekProgress > 0)
    const rightRestX = 46;
    const rightRestY = 22;
    let rightCoverX = visorX + 12;
    let rightCoverY = visorY + 2;

    if (this.peekProgress > 0) {
      // Lower the right hand slightly so one eye peeks!
      rightCoverY += 16 * this.peekProgress;
      rightCoverX += 10 * this.peekProgress;
    }

    const curRightX = rightRestX + (rightCoverX - rightRestX) * p;
    const curRightY = rightRestY + (rightCoverY - rightRestY) * p;

    this.drawSingleHand(ctx, curRightX, curRightY, 1);
    ctx.restore();
  }

  drawSingleHand(ctx, hx, hy, dir) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(dir * 0.25);

    // Hand pod
    ctx.beginPath();
    ctx.roundRect(-10, -8, 20, 16, 8);
    ctx.fillStyle = '#e2e8f0';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fill();

    // Finger pads with subtle joints
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(-4, 6);
    ctx.moveTo(3, -6);
    ctx.lineTo(3, 6);
    ctx.stroke();

    // Palm neon indicator
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = this.accentColor;
    ctx.fill();

    ctx.restore();
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

window.Mascot3DController = Mascot3DController;

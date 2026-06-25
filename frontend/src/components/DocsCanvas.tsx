import React, { useEffect, useRef } from 'react';

export const DocsCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    let particles: Particle[] = [];
    let animationFrameId: number;

    const config = {
      particleCount: 120,
      maxDistance: 150,
      nodeRadius: 1.5,
      baseSpeed: 0.3,
      nodeColor: 'rgba(0, 245, 212, 0.5)',
      lineColor: '0, 245, 212'
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * config.baseSpeed;
        this.vy = (Math.random() - 0.5) * config.baseSpeed;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, config.nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = config.nodeColor;
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      window.addEventListener('resize', resize);
      
      particles = [];
      for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => p.update());

      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.maxDistance) {
            // Very low opacity so it doesn't interfere with reading
            const opacity = (1 - (distance / config.maxDistance)) * 0.15;
            ctx.strokeStyle = `rgba(${config.lineColor}, ${opacity})`;
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => p.draw());

      animationFrameId = requestAnimationFrame(render);
    };

    init();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}></canvas>;
};

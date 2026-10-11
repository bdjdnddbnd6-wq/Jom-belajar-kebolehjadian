import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Language } from '../utils/translations';
import { soundEngine } from '../utils/audio';

export interface MarblePhysicsHandle {
  addMarble: (color: 'red' | 'blue') => void;
  removeMarble: (color: 'red' | 'blue') => void;
  drawOneMarble: (onPicked: (color: 'red' | 'blue') => void) => void;
  resetAll: (reds: number, blues: number) => void;
}

interface MarblePhysicsCanvasProps {
  lang: Language;
  reducedMotion: boolean;
  onDrawStateChange?: (isDrawing: boolean, drawnColor: 'red' | 'blue' | null) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface MarbleBody {
  id: string;
  color: 'red' | 'blue';
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  radius: number;
  isSleeping: boolean;
  sleepFrames: number;
  state: 'active' | 'exiting' | 'being_drawn' | 'showcase' | 'returning';
  exitAlpha: number;
  drawTargetY?: number;
}

const CANVAS_WIDTH = 290;
const CANVAS_HEIGHT = 330;
const MARBLE_RADIUS = 16.5; // Diameter 33px

// Curved container boundary points (forming the inner bag / jar)
const WALL_POINTS = [
  { x: 108, y: 88 },
  { x: 92, y: 112 },
  { x: 70, y: 148 },
  { x: 52, y: 195 },
  { x: 46, y: 242 },
  { x: 56, y: 282 },
  { x: 82, y: 310 },
  { x: 118, y: 323 },
  { x: 145, y: 325 },
  { x: 172, y: 323 },
  { x: 208, y: 310 },
  { x: 234, y: 282 },
  { x: 244, y: 242 },
  { x: 238, y: 195 },
  { x: 220, y: 148 },
  { x: 198, y: 112 },
  { x: 182, y: 88 },
];

export const MarblePhysicsCanvas = forwardRef<MarblePhysicsHandle, MarblePhysicsCanvasProps>(
  ({ lang, reducedMotion, onDrawStateChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const marblesRef = useRef<MarbleBody[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const animIdRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(performance.now());
    const isDrawingRef = useRef<boolean>(false);

    // Spawn a new falling marble
    const spawnMarble = (color: 'red' | 'blue', startImmediate = false) => {
      const cx = CANVAS_WIDTH / 2;
      const jitterX = (Math.random() - 0.5) * 22;
      const initialVx = (Math.random() - 0.5) * 35;
      const initialVy = reducedMotion ? 0 : 50 + Math.random() * 40;

      const newMarble: MarbleBody = {
        id: `marble-${color}-${Date.now()}-${Math.random()}`,
        color,
        x: startImmediate ? cx + jitterX : cx + jitterX,
        y: startImmediate ? 275 - Math.random() * 40 : 25,
        vx: startImmediate ? 0 : initialVx,
        vy: startImmediate ? 0 : initialVy,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 4,
        radius: MARBLE_RADIUS,
        isSleeping: startImmediate,
        sleepFrames: startImmediate ? 30 : 0,
        state: 'active',
        exitAlpha: 1.0,
      };

      marblesRef.current.push(newMarble);

      // Wake up nearby marbles so they adjust
      marblesRef.current.forEach((m) => {
        m.isSleeping = false;
        m.sleepFrames = 0;
      });
    };

    // Remove a marble by flinging it upward through the neck in an arc
    const popMarble = (color: 'red' | 'blue') => {
      // Find one active marble of that color (prefer topmost marble)
      const candidates = marblesRef.current.filter(
        (m) => m.color === color && m.state === 'active'
      );
      if (candidates.length === 0) return;

      candidates.sort((a, b) => a.y - b.y);
      const target = candidates[0];

      if (reducedMotion) {
        marblesRef.current = marblesRef.current.filter((m) => m.id !== target.id);
        return;
      }

      target.state = 'exiting';
      target.isSleeping = false;
      target.sleepFrames = 0;

      const cx = CANVAS_WIDTH / 2;
      target.vx = (cx - target.x) * 1.6 + (Math.random() - 0.5) * 90;
      target.vy = -440 - Math.random() * 60;
      target.angularVelocity = (Math.random() - 0.5) * 14;

      marblesRef.current.forEach((m) => {
        if (m.state === 'active') {
          m.isSleeping = false;
          m.sleepFrames = 0;
        }
      });
    };

    // Spawn burst particles when a marble exits or pops
    const spawnPopParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 70;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          color,
          size: 2.5 + Math.random() * 3,
          alpha: 1.0,
          life: 0,
          maxLife: 20 + Math.random() * 10,
        });
      }
    };

    // Imperative API for MarbleBagLab
    useImperativeHandle(ref, () => ({
      addMarble: (color: 'red' | 'blue') => {
        spawnMarble(color, reducedMotion);
      },
      removeMarble: (color: 'red' | 'blue') => {
        popMarble(color);
      },
      drawOneMarble: (onPicked: (color: 'red' | 'blue') => void) => {
        if (isDrawingRef.current) return;
        const activeMarbles = marblesRef.current.filter((m) => m.state === 'active');
        if (activeMarbles.length === 0) return;

        isDrawingRef.current = true;
        const picked = activeMarbles[Math.floor(Math.random() * activeMarbles.length)];
        picked.state = 'being_drawn';
        picked.isSleeping = false;
        picked.sleepFrames = 0;
        picked.drawTargetY = 48; // elevated showcase position

        soundEngine.playMarblePop();
        onDrawStateChange?.(true, null);

        // Elevate marble up through neck
        setTimeout(() => {
          picked.state = 'showcase';
          onPicked(picked.color);
          onDrawStateChange?.(true, picked.color);
          soundEngine.playMarbleDrop(picked.color === 'red' ? 1.0 : 1.25);
        }, 550);

        // Return back into the bag after 3.2 seconds
        setTimeout(() => {
          picked.state = 'returning';
          picked.vx = (Math.random() - 0.5) * 30;
          picked.vy = 40;
          soundEngine.playMarbleDrop(0.9);

          setTimeout(() => {
            picked.state = 'active';
            isDrawingRef.current = false;
            onDrawStateChange?.(false, null);
            marblesRef.current.forEach((m) => {
              m.isSleeping = false;
              m.sleepFrames = 0;
            });
          }, 600);
        }, 3200);
      },
      resetAll: (reds: number, blues: number) => {
        marblesRef.current = [];
        for (let i = 0; i < reds; i++) spawnMarble('red', true);
        for (let j = 0; j < blues; j++) spawnMarble('blue', true);
      },
    }));

    // Setup High DPI Canvas and physics loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = CANVAS_WIDTH * dpr;
      canvas.height = CANVAS_HEIGHT * dpr;
      ctx.scale(dpr, dpr);

      lastTimeRef.current = performance.now();
      const gravity = 780; // px / s^2
      const restitution = 0.44; // bounciness
      const friction = 0.982; // air damping

      const stepPhysics = (dt: number) => {
        const marbles = marblesRef.current;

        // 1. Integrate motion for active and returning marbles
        marbles.forEach((m) => {
          if (m.state === 'active' || m.state === 'returning') {
            if (!m.isSleeping) {
              m.vy += gravity * dt;
              m.vx *= Math.pow(friction, dt * 60);
              m.vy *= Math.pow(friction, dt * 60);
              m.x += m.vx * dt;
              m.y += m.vy * dt;

              m.angle += m.angularVelocity * dt;
              m.angularVelocity *= 0.97;

              const speedSq = m.vx * m.vx + m.vy * m.vy;
              if (speedSq < 4.0 && Math.abs(m.angularVelocity) < 0.2 && m.y > 180) {
                m.sleepFrames++;
                if (m.sleepFrames > 22) {
                  m.isSleeping = true;
                  m.vx = 0;
                  m.vy = 0;
                  m.angularVelocity = 0;
                }
              } else {
                m.sleepFrames = 0;
                m.isSleeping = false;
              }
            }
          } else if (m.state === 'being_drawn') {
            const targetX = CANVAS_WIDTH / 2;
            const targetY = m.drawTargetY || 48;
            m.x += (targetX - m.x) * 0.15;
            m.y += (targetY - m.y) * 0.15;
            m.angle += 0.05;
          } else if (m.state === 'showcase') {
            m.angle += 0.02;
          } else if (m.state === 'exiting') {
            m.vy += gravity * 0.9 * dt;
            m.x += m.vx * dt;
            m.y += m.vy * dt;
            m.angle += m.angularVelocity * dt;
            m.exitAlpha = Math.max(0, m.exitAlpha - dt * 1.8);

            if (m.y < 35 || m.exitAlpha <= 0.05) {
              spawnPopParticles(
                m.x,
                m.y,
                m.color === 'red' ? '#ef4444' : '#3b82f6'
              );
              marblesRef.current = marblesRef.current.filter((item) => item.id !== m.id);
            }
          }
        });

        // 2. Circle-Circle Collisions
        const activeMarbles = marbles.filter(
          (m) => m.state === 'active' || m.state === 'returning'
        );
        for (let i = 0; i < activeMarbles.length; i++) {
          for (let j = i + 1; j < activeMarbles.length; j++) {
            const m1 = activeMarbles[i];
            const m2 = activeMarbles[j];
            const dx = m2.x - m1.x;
            const dy = m2.y - m1.y;
            const distSq = dx * dx + dy * dy;
            const minDist = m1.radius + m2.radius;
            if (distSq < minDist * minDist && distSq > 0.0001) {
              const dist = Math.sqrt(distSq);
              const nx = dx / dist;
              const ny = dy / dist;
              const overlap = minDist - dist;

              m1.x -= nx * overlap * 0.5;
              m1.y -= ny * overlap * 0.5;
              m2.x += nx * overlap * 0.5;
              m2.y += ny * overlap * 0.5;

              const rvx = m2.vx - m1.vx;
              const rvy = m2.vy - m1.vy;
              const velAlongNormal = rvx * nx + rvy * ny;
              if (velAlongNormal < 0) {
                const impulse = -(1 + restitution) * velAlongNormal * 0.5;
                m1.vx -= impulse * nx;
                m1.vy -= impulse * ny;
                m2.vx += impulse * nx;
                m2.vy += impulse * ny;

                const tx = -ny;
                const ty = nx;
                const relTan = rvx * tx + rvy * ty;
                const frictionImpulse = relTan * 0.08;
                m1.vx += frictionImpulse * tx;
                m1.vy += frictionImpulse * ty;
                m2.vx -= frictionImpulse * tx;
                m2.vy -= frictionImpulse * ty;
                m1.angularVelocity += (relTan / m1.radius) * 0.12;
                m2.angularVelocity -= (relTan / m2.radius) * 0.12;

                if (Math.abs(velAlongNormal) > 28) {
                  soundEngine.playMarbleCollision(
                    Math.min(1, Math.abs(velAlongNormal) / 260)
                  );
                }
              }
              m1.isSleeping = false;
              m1.sleepFrames = 0;
              m2.isSleeping = false;
              m2.sleepFrames = 0;
            }
          }
        }

        // 3. Circle-Wall Collisions
        for (let i = 0; i < activeMarbles.length; i++) {
          const m = activeMarbles[i];
          for (let k = 0; k < WALL_POINTS.length - 1; k++) {
            const p1 = WALL_POINTS[k];
            const p2 = WALL_POINTS[k + 1];
            const segX = p2.x - p1.x;
            const segY = p2.y - p1.y;
            const lenSq = segX * segX + segY * segY;
            if (lenSq === 0) continue;
            const t = Math.max(
              0,
              Math.min(1, ((m.x - p1.x) * segX + (m.y - p1.y) * segY) / lenSq)
            );
            const closeX = p1.x + t * segX;
            const closeY = p1.y + t * segY;
            const dx = m.x - closeX;
            const dy = m.y - closeY;
            const distSq = dx * dx + dy * dy;
            if (distSq < m.radius * m.radius && distSq > 0.0001) {
              const dist = Math.sqrt(distSq);
              const nx = dx / dist;
              const ny = dy / dist;
              const overlap = m.radius - dist;

              m.x += nx * overlap;
              m.y += ny * overlap;
              const vDotN = m.vx * nx + m.vy * ny;
              if (vDotN < 0) {
                m.vx -= (1 + restitution) * vDotN * nx;
                m.vy -= (1 + restitution) * vDotN * ny;

                const tx = -ny;
                const ty = nx;
                const vDotT = m.vx * tx + m.vy * ty;
                m.vx -= vDotT * 0.12 * tx;
                m.vy -= vDotT * 0.12 * ty;
                m.angularVelocity += (vDotT / m.radius) * 0.2;

                if (Math.abs(vDotN) > 32) {
                  soundEngine.playMarbleCollision(
                    Math.min(1, Math.abs(vDotN) / 280)
                  );
                }
              }
            }
          }
        }

        // 4. Update particles
        particlesRef.current.forEach((p) => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += gravity * 0.4 * dt;
          p.life++;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        });
        particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);
      };

      // Main Render Function
      const render = () => {
        const now = performance.now();
        const elapsed = Math.min(0.04, (now - lastTimeRef.current) / 1000);
        lastTimeRef.current = now;

        const subSteps = 2;
        const subDt = elapsed / subSteps;
        for (let s = 0; s < subSteps; s++) {
          stepPhysics(subDt);
        }

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // --- LAYER 1: Draw Container Back Background ---
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(WALL_POINTS[0].x, WALL_POINTS[0].y);
        for (let i = 1; i < WALL_POINTS.length; i++) {
          ctx.lineTo(WALL_POINTS[i].x, WALL_POINTS[i].y);
        }
        ctx.closePath();

        const bagGrad = ctx.createLinearGradient(0, 80, 0, 325);
        bagGrad.addColorStop(0, '#d97706');
        bagGrad.addColorStop(0.5, '#b45309');
        bagGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = bagGrad;
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#92400e';
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(CANVAS_WIDTH / 2, 310, 80, 16, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fill();
        ctx.restore();

        // --- LAYER 2: Draw Marbles ---
        marblesRef.current.forEach((m) => {
          ctx.save();
          ctx.globalAlpha = m.exitAlpha;

          if (m.y > 140 && m.state !== 'being_drawn' && m.state !== 'showcase') {
            const shadowDistance = Math.min(18, 318 - m.y);
            const shadowScale = Math.max(0.4, 1 - shadowDistance / 60);
            ctx.beginPath();
            ctx.ellipse(
              m.x,
              Math.min(320, m.y + m.radius * 0.9),
              m.radius * 0.95 * shadowScale,
              m.radius * 0.35 * shadowScale,
              0,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = 'rgba(0,0,0,0.28)';
            ctx.fill();
          }

          ctx.translate(m.x, m.y);
          ctx.rotate(m.angle);

          ctx.beginPath();
          ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
          const sphereGrad = ctx.createRadialGradient(
            -m.radius * 0.35,
            -m.radius * 0.35,
            m.radius * 0.1,
            0,
            0,
            m.radius
          );
          if (m.color === 'red') {
            sphereGrad.addColorStop(0, '#fecdd3');
            sphereGrad.addColorStop(0.3, '#f43f5e');
            sphereGrad.addColorStop(0.8, '#e11d48');
            sphereGrad.addColorStop(1, '#881337');
          } else {
            sphereGrad.addColorStop(0, '#bae6fd');
            sphereGrad.addColorStop(0.3, '#38bdf8');
            sphereGrad.addColorStop(0.8, '#0284c7');
            sphereGrad.addColorStop(1, '#0c4a6e');
          }
          ctx.fillStyle = sphereGrad;
          ctx.fill();

          ctx.lineWidth = 1.6;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 3;
          if (m.color === 'red') {
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('★', 0, 0.5);
            ctx.font = 'bold 8px sans-serif';
            ctx.fillText(lang === 'ms' ? 'M' : 'R', 0, 9);
          } else {
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('◆', 0, 0.5);
            ctx.font = 'bold 8px sans-serif';
            ctx.fillText('B', 0, 9);
          }
          ctx.shadowBlur = 0;

          ctx.beginPath();
          ctx.arc(-m.radius * 0.35, -m.radius * 0.35, m.radius * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.fill();
          ctx.restore();
        });

        // --- LAYER 3: Particles ---
        particlesRef.current.forEach((p) => {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        });

        // --- LAYER 4: Draw Container Front Neck & Rim ---
        ctx.save();
        const neckY = 88;
        const neckRx = 40;
        const neckRy = 12;

        ctx.beginPath();
        ctx.ellipse(CANVAS_WIDTH / 2, neckY, neckRx, neckRy, 0, 0, Math.PI);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#92400e';
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(CANVAS_WIDTH / 2, neckY, neckRx, neckRy, 0, 0, Math.PI);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#fef3c7';
        ctx.stroke();

        const knotX = CANVAS_WIDTH / 2;
        const knotY = neckY + 10;
        ctx.beginPath();
        ctx.arc(knotX, knotY, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#78350f';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(knotX, knotY);
        ctx.quadraticCurveTo(knotX - 18, knotY + 25, knotX - 14, knotY + 38);
        ctx.moveTo(knotX, knotY);
        ctx.quadraticCurveTo(knotX + 18, knotY + 25, knotX + 14, knotY + 38);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#fef3c7';
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        animIdRef.current = requestAnimationFrame(render);
      };

      animIdRef.current = requestAnimationFrame(render);
      return () => {
        if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      };
    }, [lang, reducedMotion, onDrawStateChange]);

    return (
      <div className="relative w-[290px] h-[330px] flex items-center justify-center select-none">
        <canvas
          ref={canvasRef}
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          className="block touch-none"
        />
      </div>
    );
  }
);

MarblePhysicsCanvas.displayName = 'MarblePhysicsCanvas';

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  alphaDir: number;
  color: string;
  trail: { x: number; y: number }[];
}

const COLORS = [
  "hsl(160, 84%, 39%)",  // primary emerald
  "hsl(174, 72%, 40%)",  // teal
  "hsl(199, 89%, 48%)",  // cyan
  "hsl(280, 65%, 60%)",  // purple (Solana violet)
  "hsl(38, 92%, 50%)",   // gold accent
];

function hexagonPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn particles
    const COUNT = 80;
    particlesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.5 + 0.8,
      alpha: Math.random(),
      alphaDir: Math.random() > 0.5 ? 0.005 : -0.005,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      trail: [],
    }));

    // Hexagonal grid nodes
    const hexNodes: { x: number; y: number }[] = [];
    const spacing = 90;
    for (let row = 0; row * spacing * 0.866 < canvas.height + spacing; row++) {
      const offset = row % 2 === 0 ? 0 : spacing / 2;
      for (let col = 0; col * spacing < canvas.width + spacing; col++) {
        hexNodes.push({ x: col * spacing + offset, y: row * spacing * 0.866 });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw hex grid
      ctx.strokeStyle = "hsl(220, 14%, 14%)";
      ctx.lineWidth = 0.5;
      hexNodes.forEach(({ x, y }) => {
        hexagonPath(ctx, x, y, 44);
        ctx.stroke();
      });

      // Draw connection lines between nearby particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist / 120) * 0.25;
            ctx.strokeStyle = `hsl(160, 84%, 39%, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw & update particles
      particles.forEach((p) => {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();

        // Trail
        p.trail.forEach((t, i) => {
          const trailAlpha = (i / p.trail.length) * p.alpha * 0.3;
          ctx.beginPath();
          ctx.arc(t.x, t.y, p.radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(")", `, ${trailAlpha})`).replace("hsl(", "hsla(");
          ctx.fill();
        });

        // Glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        grd.addColorStop(0, p.color.replace(")", `, ${p.alpha * 0.6})`).replace("hsl(", "hsla("));
        grd.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(")", `, ${p.alpha})`).replace("hsl(", "hsla(");
        ctx.fill();

        // Update
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir;
        if (p.alpha > 1 || p.alpha < 0.1) p.alphaDir *= -1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.65 }}
    />
  );
}

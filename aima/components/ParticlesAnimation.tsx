import React, { useRef, useEffect } from "react";

const generateNormal = (mean: number, stdDev: number) => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
};

const NUM_PARTICLES = 600;
const PARTICLE_SIZE = 0.2;
const SPEED = 40000;

interface Particle {
  x: number;
  y: number;
  diameter: number;
  duration: number;
  amplitude: number;
  offsetY: number;
  arc: number;
  startTime: number;
  colour: string;
}

function rand(low: number, high: number) {
  return Math.random() * (high - low) + low;
}

function createParticle(canvas: HTMLCanvasElement): Particle {
  const colour = {
    r: 255,
    g: Math.round(generateNormal(125, 20)),
    b: 50,
    a: rand(0.1, 0.5), // Lower opacity
  };
  return {
    x: -2,
    y: -2,
    diameter: Math.max(0, generateNormal(PARTICLE_SIZE, PARTICLE_SIZE / 4)),
    duration: generateNormal(SPEED, SPEED * 0.1),
    amplitude: generateNormal(16, 4),
    offsetY: generateNormal(0, 10),
    arc: Math.PI * 2,
    startTime: performance.now() - rand(0, SPEED),
    colour: `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`,
  };
}

function moveParticle(particle: Particle, time: number) {
  const progress =
    ((time - particle.startTime) % particle.duration) / particle.duration;
  return {
    ...particle,
    x: progress,
    y:
      Math.sin(progress * particle.arc) * particle.amplitude + particle.offsetY,
  };
}

function drawParticle(
  particle: Particle,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  const vh = canvas.height / 100;
  ctx.fillStyle = particle.colour;
  ctx.beginPath();
  ctx.ellipse(
    particle.x * canvas.width,
    particle.y * vh + canvas.height / 2,
    particle.diameter * vh,
    particle.diameter * vh,
    0,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

const ParticlesAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles: Particle[] = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(createParticle(canvas));
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle, index) => {
        particles[index] = moveParticle(particle, time);
        drawParticle(particle, canvas, ctx);
      });
      requestRef.current = requestAnimationFrame(draw);
    };
    requestRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      className="hidden md:block md:absolute top-0 left-0 -z-10"
    />
  );
};

export default ParticlesAnimation;

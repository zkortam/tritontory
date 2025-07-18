"use client";

import { useEffect, useRef } from "react";

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedHeroBackground({ className }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full size of its container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Colors for each section - navy, purple, blue, maroon
    const colors = [
      { r: 12, g: 45, b: 72 },   // Navy (Tory)
      { r: 58, g: 12, b: 163 },  // Purple (Today)
      { r: 0, g: 119, b: 182 },  // Blue (Science)
      { r: 106, g: 4, b: 15 },   // Maroon (Law)
    ];

    // Gradient circles
    const circles: Array<{
      x: number;
      y: number;
      radius: number;
      color: { r: number; g: number; b: number };
      vx: number;
      vy: number;
    }> = [];
    for (let i = 0; i < 4; i++) {
      circles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: (Math.random() * 0.2 + 0.2) * Math.min(canvas.width, canvas.height),
        color: colors[i],
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 0.5 - 0.25,
      });
    }

    let animationFrameId: number;
    const animate = () => {
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add blue noise texture
      ctx.globalCompositeOperation = 'screen';

      // Draw gradient circles
      for (const circle of circles) {
        // Move the circle
        circle.x += circle.vx;
        circle.y += circle.vy;

        // Bounce off walls
        if (circle.x < 0 || circle.x > canvas.width) circle.vx *= -1;
        if (circle.y < 0 || circle.y > canvas.height) circle.vy *= -1;

        // Create gradient
        const gradient = ctx.createRadialGradient(
          circle.x, circle.y, 0,
          circle.x, circle.y, circle.radius
        );

        const { r, g, b } = circle.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add vignette effect
      ctx.globalCompositeOperation = 'source-over';
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.8
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', inset: 0, zIndex: -1 }}
    />
  );
}

"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ThreeDTiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glareOpacity?: number;
  onClick?: () => void;
}

export default function ThreeDTiltCard({
  children,
  className = "",
  intensity = 12,
  glareOpacity = 0.25,
  onClick,
}: ThreeDTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position in relative coordinates (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Springs for smooth physics
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D rotation transforms
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-intensity, intensity]);

  // Dynamic specular sheen reflection position
  const glareX = useTransform(smoothX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="perspective-1000 w-full"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={`relative overflow-hidden rounded-2xl transition-shadow duration-300 ${className} ${
          isHovered
            ? "shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(16,185,129,0.15)]"
            : "shadow-lg"
        }`}
      >
        {/* Children content */}
        <div className="relative z-10">{children}</div>

        {/* Dynamic Specular Glare / Holographic Light Sheen */}
        {isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl mix-blend-overlay transition-opacity duration-300"
            style={{
              opacity: glareOpacity,
              background: `radial-gradient(circle 250px at ${glareX} ${glareY}, rgba(255, 255, 255, 0.8), transparent 80%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

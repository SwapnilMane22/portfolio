import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './AnimatedBackground.css';

// ==========================================
// BACKGROUND ANIMATION CONFIGURATION
// ==========================================
// Adjust the number of blobs here
const NUM_BLOBS = 5; 
// Adjust the speed here (lower number = faster movement, higher = slower)
const ANIMATION_BASE_DURATION = 7; 
// ==========================================

const AnimatedBackground = () => {
  const [blobs, setBlobs] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // Generate dynamic blobs on mount
    const newBlobs = Array.from({ length: NUM_BLOBS }).map((_, i) => {
      // Random generation for path and sizing
      const size = Math.floor(Math.random() * 40) + 30; // 30vw to 70vw
      const startX = Math.floor(Math.random() * 100);
      const startY = Math.floor(Math.random() * 100);
      
      const xKeyframes = Array.from({ length: 5 }).map(() => `${Math.floor(Math.random() * 80) - 40}vw`);
      const yKeyframes = Array.from({ length: 5 }).map(() => `${Math.floor(Math.random() * 80) - 40}vh`);
      
      // Ensure smooth looping by making last frame same as first
      xKeyframes.push(xKeyframes[0]);
      yKeyframes.push(yKeyframes[0]);

      return {
        id: i,
        size: `${size}vw`,
        top: `${startY}%`,
        left: `${startX}%`,
        duration: ANIMATION_BASE_DURATION + Math.random() * 10,
        delay: Math.random() * 5,
        xParams: xKeyframes,
        yParams: yKeyframes,
        scaleParams: [1, 1.2, 0.8, 1.1, 1],
        opacityParams: [0.4, 0.7, 0.3, 0.6, 0.4],
      };
    });

    setBlobs(newBlobs);
  }, []);

  return (
    <div className="animated-bg">
      {/* Dynamic Blobs */}
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="blob dynamic-blob"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            marginTop: `-${parseFloat(blob.size)/2}vw`,
            marginLeft: `-${parseFloat(blob.size)/2}vw`,
          }}
          animate={{
            scale: blob.scaleParams,
            opacity: blob.opacityParams,
            x: blob.xParams,
            y: blob.yParams,
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "linear",
            delay: blob.delay
          }}
        />
      ))}

      {/* Cursor tracking blob */}
      <motion.div 
        className="cursor-blob"
        style={{
          left: mousePos.x - 50,
          top: mousePos.y - 50,
          width: 160, // Default size, can be made dynamic
          height: 160, // Default size, can be made dynamic
        }}
        animate={{
          scale: [0.9, 1.05, 0.95],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;

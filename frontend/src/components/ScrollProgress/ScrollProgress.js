import React from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import './ScrollProgress.css'

const ScrollProgress = () => {
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.5 })

  if (prefersReducedMotion) return null

  return (
    <div className="scroll-progress" aria-hidden="true">
      <motion.div className="scroll-progress__bar" style={{ scaleX }} />
    </div>
  )
}

export default ScrollProgress


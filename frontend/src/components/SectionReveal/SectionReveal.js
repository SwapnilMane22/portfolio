import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import './SectionReveal.css'

const SectionReveal = ({ children, className = '', style }) => {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'end 25%'],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.6 })
  const parallaxY = useTransform(smooth, [0, 1], prefersReducedMotion ? [0, 0] : [10, -10])
  const parallaxOpacity = useTransform(smooth, [0, 0.25, 1], prefersReducedMotion ? [1, 1, 1] : [0.75, 1, 1])

  const variants = prefersReducedMotion
    ? {
        hidden: { opacity: 1, y: 0 },
        show: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, scale: 0.95, filter: 'blur(4px)' },
        show: {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        },
      }

  return (
    <motion.div
      ref={ref}
      className={`section-reveal ${className}`.trim()}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1, margin: '0px 0px -50px 0px' }}
      variants={variants}
    >
      <motion.div className="section-reveal__inner" style={{ y: parallaxY, opacity: parallaxOpacity }}>
        {children}
      </motion.div>
      <div className="section-reveal__divider" aria-hidden="true" />
    </motion.div>
  )
}

SectionReveal.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
}

export default SectionReveal


import React from 'react'
import uniqid from 'uniqid'
import { useProfile } from '../../contexts/ProfileContext'
import { motion } from 'framer-motion'
import './Skills.css'

const Skills = () => {
  const { profile } = useProfile()
  const skills = profile.skills || []
  if (!skills.length) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
  }

  return (
    <section className='section skills' id='skills'>
      <h2 className='section__title'>Skills</h2>
      <motion.ul 
        className='skills__list'
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.2 }}
      >
        {skills.map((skill) => (
          <motion.li 
            key={uniqid()} 
            className='skills__list-item'
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            {skill}
          </motion.li>
        ))}
      </motion.ul>
    </section>
  )
}

export default Skills
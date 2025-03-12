import React from 'react'
import uniqid from 'uniqid'
import { projects } from '../../portfolio'
import ProjectContainer from '../ProjectContainer/ProjectContainer'
import './Projects.css'
import { motion } from "framer-motion";

const Projects = () => {
  if (!projects.length) return null

  return (
    <section id='projects' className='section projects'>
      <h2 className='section__title'>Projects</h2>

      <div className='projects__grid'>
      {projects.map((project, i) => (
          <motion.div 
            key={uniqid()}
            className="relative"
            initial={{ 
              y: 50,
              opacity: 0
            }}
            whileInView={{ 
              y: 0,
              opacity: 1
            }}
            transition={{ 
              duration: 0.5,
              delay: i * 0.1
            }}
            whileHover={{ 
              scale: 1.05,
              zIndex: 10
            }}
          >
          <ProjectContainer key={uniqid()} project={project} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default Projects
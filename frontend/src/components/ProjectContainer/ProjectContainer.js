import React, { useRef } from 'react'
import uniqid from 'uniqid'
import GitHubIcon from '@mui/icons-material/GitHub'
import LaunchIcon from '@mui/icons-material/Launch'
import './ProjectContainer.css'
import { motion } from "framer-motion";

const ProjectContainer = ({ project }) => {
  const descRef = useRef(null);


  return (
    <>
  <motion.div className='project' 
        whileHover={{ y: -7 }} 
        style={{ cursor: 'pointer' }}>
          
    <h3 className='project__heading'>{project.name}</h3>

    {project.image && (
          <div className='project__image-container'>
            <img 
              src={project.image} 
              alt={project.name} 
              className='project__image'
            />
          </div>
        )}
        
        <div className='project__description-container'>
          <p ref={descRef} className='project__description-preview'>
            {project.description} 
          </p>
        </div>
    
    {project.stack && (
      <ul className='project__stack'>
        {project.stack.map((item, i) => (
          <li key={uniqid()} className='project__stack-item'>
            {item}
          </li>
        ))}
      </ul>
    )}
    

    {project.sourceCode && (
      <a
        href={project.sourceCode}
        aria-label='source code'
        className='link link--icon'
      >
        <GitHubIcon />
      </a>
    )}

    {project.livePreview && (
      <a
        href={project.livePreview}
        aria-label='live preview'
        className='link link--icon'
      >
        <LaunchIcon />
      </a>
    )}
  </motion.div>
  </>
  )
}

export default ProjectContainer
import React from 'react'
import uniqid from 'uniqid'
import GitHubIcon from '@mui/icons-material/GitHub'
import LaunchIcon from '@mui/icons-material/Launch'
import './ProjectContainer.css'
import { motion } from "framer-motion";

const ProjectContainer = ({ project }) => (

  <motion.div className='project' 
        whileHover={{ y: -7 }} >
          
    <h3 className='project__heading'>{project.name}</h3>

    {project.imageUrl && (
          <div className='project__image-container'>
            <img 
              src={project.imageUrl} 
              alt={project.name} 
              className='project__image'
            />
          </div>
        )}

<div className='project__description-container'>
          <p className='project__description-preview'>
            {project.description.substring(0, 100)}
            {project.description.length > 100 && '...'}
          </p>
        </div>

<div className='project__view-more'>
          <span>View Details</span>
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
)

export default ProjectContainer
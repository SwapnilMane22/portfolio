import React, { useRef, useState } from 'react'
import uniqid from 'uniqid'
import GitHubIcon from '@mui/icons-material/GitHub'
import LaunchIcon from '@mui/icons-material/Launch'
import './ProjectContainer.css'
import { motion } from "framer-motion";
import ProjectPopup from '../ProjectPopup/ProjectPopup';

const ProjectContainer = ({ project }) => {
  const descRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);


  return (
    <>
  <motion.div className='project' 
        whileHover={{ y: -7 }} 
        style={{ cursor: 'pointer' }}
        onClick={openPopup}>
          
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
    

    {(project.sourceCode || project.livePreview) && (
      <div className='project__links'>
        {project.sourceCode && (
          <a
            href={project.sourceCode}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='source code'
            className='link link--icon'
          >
            <GitHubIcon />
          </a>
        )}
        {project.livePreview && (
          <a
            href={project.livePreview}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='live preview'
            className='link link--icon'
          >
            <LaunchIcon />
          </a>
        )}
      </div>
    )}
  </motion.div>

  <ProjectPopup 
        project={project} 
        isOpen={isPopupOpen} 
        onClose={closePopup} 
      />
  </>
  )
}

export default ProjectContainer
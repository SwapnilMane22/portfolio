// ProjectPopup.js
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import { motion, AnimatePresence } from 'framer-motion';
import './ProjectPopup.css';

const ProjectPopup = ({ project, isOpen, onClose }) => {
  const modalRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Close if clicking outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Restore scrolling when modal is closed
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // If not open, don't render anything
  if (!isOpen) return null;

  // Render the modal using a portal
  return createPortal(
    <AnimatePresence className='project'>
      {isOpen && (
        <div className="popup-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.3 }}
            className="popup-container"
            ref={modalRef}
          >
            <div className="popup-header">
              <h2 className="popup-title">{project.name}</h2>
              <button onClick={onClose} className="popup-close-button">
                <CloseIcon />
              </button>
            </div>

            {/* {project.image && (
              <div className="popup-image-container">
                <img 
                  src={project.image} 
                  alt={project.name} 
                  className="popup-image"
                />
              </div>
            )} */}

            <div className="popup-content">
              <div className="popup-description">
                {project.description}
              </div>

              {project.stack && (
                <div className="popup-stack-container">
                  <h3 className="popup-subtitle">Technologies Used:</h3>
                  <ul className="popup-stack">
                    {project.stack.map((item, i) => (
                      <li key={`stack-${i}`} className="popup-stack-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="popup-links">
                {project.sourceCode && (
                  <a
                    href={project.sourceCode}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="popup-link"
                  >
                    <GitHubIcon /> View Source Code
                  </a>
                )}

                {project.livePreview && (
                  <a
                    href={project.livePreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="popup-link"
                  >
                    <LaunchIcon /> Live Preview
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body // This ensures the modal is attached to the body, outside of your app's DOM
  );
};

export default ProjectPopup;
import React, { useEffect, useRef, useState } from 'react'
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import CloseIcon from '@mui/icons-material/Close';
import { about } from '../../portfolio'
import './About.css'
import Typed from 'typed.js'
import CIcon from '@coreui/icons-react';
import * as icon from '@coreui/icons';
import { motion } from "framer-motion";

const About = () => {
  const { name, role, role2, role3, description, resume, social } = about
  const typedRef = useRef(null);
  const [showResume, setShowResume] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIoS, setIsIoS] = useState(false);

  useEffect(() => {
    
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/i.test(userAgent));
    setIsIoS(/iphone|ipad|ipod/i.test(userAgent));    

    if (typedRef.current) {
      const typed = new Typed(typedRef.current, {
        strings: [role, role2, role3].filter(Boolean),
        typeSpeed: 100,
        backSpeed: 50,
        loop: true,
      });

      return () => {
        typed.destroy(); // Cleanup on unmount
      };
    }
  }, [role, role2, role3]);

  const handleResumeClick = (e) => {
    e.preventDefault();
    
    if (isAndroid) {
      // For Android, use Google Docs Viewer
      const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(resume)}`;
      window.open(googleDocsUrl, '_blank');
    }
    else if (isIoS) {
      // For Android, use Google Docs Viewer
      window.open(resume, '_blank');
    }  
    else {
      // For other platforms, show the modal
      setShowResume(true);
    }
  };

  const handleCloseResume = () => {
    setShowResume(false);
  };

  const characterAnimation = {
    hidden: { opacity: 0, y: -30 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 2
      }
    })
  };

  return (
    <div className='about center'>
      {name && (
        <motion.h1 initial="hidden"
        whileInView="visible"
        variants={characterAnimation}>
          Hi, I am <motion.span className='about__name'>{name}</motion.span>
        </motion.h1>
      )}
      
      {role && (
        <h2 className="about__role">
          <span ref={typedRef} />
        </h2>
      )}

      <p className='about__desc'>{description && description}</p>

      <div className='about__contact center'>
        {resume && (
          <a href={resume} onClick={handleResumeClick}>
            <span type='button' className='btn btn--outline'>
              Resume
            </span>
          </a>
        )}

        {social && (
          <>
            {social.github && (
              <a
                href={social.github}
                aria-label='github'
                className='link link--icon'
              >
                <GitHubIcon
                style={{ 
                  display: 'block',
                  width: '24px',
                  height: '24px',
                  fill: 'currentColor'
                }}
                 />
              </a>
            )}

            {social.linkedin && (
              <a
                href={social.linkedin}
                aria-label='linkedin'
                className='link link--icon'
              >
                <LinkedInIcon 
                style={{ 
                  display: 'block',
                  width: '26px',
                  height: '26px',
                  fill: 'currentColor'
                }}
                />
              </a>
            )}

            {social.leetcode && (
              <a
                href={social.leetcode}
                aria-label='leetcode'
                className='link link--icon'
              >
              <CIcon 
                  icon={icon.cibLeetcode} 
                  className='link link--icon'
                  style={{ 
                    display: 'block',
                    width: '26px',
                    height: '26px',
                    fill: 'currentColor',
                    marginTop: 3.5,
                    paddingRight: 0,
                    marginRight: 0
                  }}
                />
              </a> 
            )}
            
          </>
        )}
      </div>

      {/* PDF Modal */}
      {showResume && !isAndroid && !isIoS && (
        <div className="resume-modal">
          <div className="resume-modal__content">
            <button 
              className="resume-modal__close" 
              onClick={handleCloseResume}
            >
              <CloseIcon/>
            </button>
            <iframe
              src={`${resume}#view=FitH`}
              title="Resume"
              className="resume-modal__iframe"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default About
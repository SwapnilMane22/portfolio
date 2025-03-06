import React, { useEffect, useRef } from 'react'
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import { about } from '../../portfolio'
import './About.css'
import Typed from 'typed.js'
import CIcon from '@coreui/icons-react';
import * as icon from '@coreui/icons';

const About = () => {
  const { name, role, role2, role3, description, resume, social } = about
  const typedRef = useRef(null);

  useEffect(() => {
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

  return (
    <div className='about center'>
      {name && (
        <h1>
          Hi, I am <span className='about__name'>{name}</span>
        </h1>
      )}
      
      {role && (
        <h2 className="about__role">
          <span ref={typedRef} />
        </h2>
      )}

      <p className='about__desc'>{description && description}</p>

      <div className='about__contact center'>
        {resume && (
          <a href={resume}>
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
    </div>
  )
}

export default About
import React from 'react'
import { useContext, useState, useRef, useEffect } from 'react'
import Brightness2Icon from '@mui/icons-material/Brightness2'
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import { ThemeContext } from '../../contexts/theme'
import { journey, projects, skills, contact } from '../../portfolio'
import { motion, AnimatePresence } from 'framer-motion'
import './Nabar.css'

const Navbar = () => {
  // const [{ themeName, toggleTheme }] = useContext(ThemeContext) // Correct destructuring
  const contextValue = useContext(ThemeContext) || [{ themeName: 'dark', toggleTheme: () => {} }];
  const [{ themeName, toggleTheme }] = contextValue;
  const [showNavList, setShowNavList] = useState(false)
  const menuRef = useRef(null)
  
  const toggleNavList = () => setShowNavList(!showNavList)
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowNavList(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className='center nav'>
      <div className="nav__container" ref={menuRef}>
        <AnimatePresence>
          {showNavList && (
            <motion.ul
              className='nav__list mobile-dropdown'
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {journey.length ? (
                <li className='nav__list-item'>
                  <a
                    href='#journey'
                    onClick={toggleNavList}
                    className='link link--nav heading'
                  >
                    About
                  </a>
                </li>
              ) : null}

              {projects.length ? (
                <li className='nav__list-item'>
                  <a
                    href='#projects'
                    onClick={toggleNavList}
                    className='link link--nav heading'
                  >
                    Projects
                  </a>
                </li>
              ) : null}

              {skills.length ? (
                <li className='nav__list-item'>
                  <a
                    href='#skills'
                    onClick={toggleNavList}
                    className='link link--nav'
                  >
                    Skills
                  </a>
                </li>
              ) : null}

              {contact.email ? (
                <li className='nav__list-item'>
                  <a
                    href='#contact'
                    onClick={toggleNavList}
                    className='link link--nav'
                  >
                    Contact
                  </a>
                </li>
              ) : null}
            </motion.ul>
          )}
        </AnimatePresence>
        
        <ul className='nav__list desktop-menu'>
          {journey.length ? (
            <li className='nav__list-item'>
              <a href='#journey' className='link link--nav heading'>
                About
              </a>
            </li>
          ) : null}

          {projects.length ? (
            <li className='nav__list-item'>
              <a href='#projects' className='link link--nav heading'>
                Projects
              </a>
            </li>
          ) : null}

          {skills.length ? (
            <li className='nav__list-item'>
              <a href='#skills' className='link link--nav'>
                Skills
              </a>
            </li>
          ) : null}

          {contact.email ? (
            <li className='nav__list-item'>
              <a href='#contact' className='link link--nav'>
                Contact
              </a>
            </li>
          ) : null}
        </ul>
      </div>

      <button
        type='button'
        onClick={toggleTheme}
        className='btn btn--icon nav__theme'
        aria-label='toggle theme'
      >
        {themeName === 'dark' ? <WbSunnyRoundedIcon /> : <Brightness2Icon />}
      </button>

      <button
        type='button'
        onClick={toggleNavList}
        className='btn btn--icon nav__hamburger'
        aria-label='toggle navigation'
      >
        {showNavList ? <CloseIcon /> : <MenuIcon />}
      </button>
    </nav>
  )
}

export default Navbar
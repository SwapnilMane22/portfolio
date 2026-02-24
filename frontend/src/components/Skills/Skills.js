import React from 'react'
import uniqid from 'uniqid'
import { useProfile } from '../../contexts/ProfileContext'
import './Skills.css'

const Skills = () => {
  const { profile } = useProfile()
  const skills = profile.skills || []
  if (!skills.length) return null

  return (
    <section className='section skills' id='skills'>
      <h2 className='section__title'>Skills</h2>
      <ul className='skills__list'>
        {skills.map((skill) => (
          <li key={uniqid()} className='skills__list-item'>
            {skill}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Skills
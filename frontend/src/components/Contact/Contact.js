import React from 'react'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import { useProfile } from '../../contexts/ProfileContext'
import './Contact.css'

const Contact = () => {
  const { profile } = useProfile()
  const contact = profile.contact || {}
  if (!contact.email) return null

  return (
    <section className='section contact' id='contact'>
      <h2 className='section__title'>Contact</h2>
      <p className='section__subtitle'>
        Have a project in mind or want to connect? I’d love to hear from you.
      </p>
      <div className='contact__cta'>
        <a href={`mailto:${contact.email}`} className='contact__link' target='_blank' rel='noopener noreferrer'>
          <EmailOutlinedIcon className='contact__icon' aria-hidden />
          <span>Email me</span>
        </a>
      </div>
    </section>
  )
}

export default Contact
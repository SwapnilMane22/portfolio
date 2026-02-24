/**
 * Local asset mappings only. Profile data (about, journey, projects, skills, contact) comes from GET /api/profile (knowledge.json).
 */
import chatbot from './assets/image/chatbot.jpg'
import PortfolioCover from './assets/image/portfolio.jpg'
import movie from './assets/image/movie.jpg'
import soh from './assets/image/soh.png'
import ar from './assets/image/ar.jpg'
import dm from './assets/image/datamining.jpg'
import tcs from './assets/image/ticketing.jpg'
import course from './assets/image/course.jpg'
import tot from './assets/image/Neural Networks.png'
import workrise from './assets/image/hero-workrise.png'
import ocr from './assets/image/ocr.jpg'
import iot from './assets/image/IOT.png'
import arduino from './assets/image/arduino.jpg'

export const projectImages = {
  chatbot,
  portfolio: PortfolioCover,
  movie,
  soh,
  ar,
  dm,
  tcs,
  course,
  tot,
  workrise,
  ocr,
  iot,
  arduino,
}

/** Attach image to each project from API using imageKey */
export function attachProjectImages(projects = []) {
  return projects.map((p) => ({
    ...p,
    image: p.imageKey ? projectImages[p.imageKey] : null,
  }))
}

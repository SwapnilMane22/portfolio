import { useContext, React } from 'react'
import { ThemeContext } from './contexts/theme'
import Header from './components/Header/Header'
import About from './components/About/About'
import ChatBot from './components/ChatBot/ChatBot'
import Journey from './components/Journey/Journey'
import Projects from './components/Projects/Projects'
import Skills from './components/Skills/Skills'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'
import './App.css'
// import Home from './pages/Home/Home'

const App = () => {
  const [{ themeName }] = useContext(ThemeContext)

  return (
    <div id='top' className={`${themeName} app`}>
      <Header />

      <main>
        {/* <Home/> */}
        <About />
        <Journey/>
        <Projects />
        <Skills />
        <Contact />
      </main>

      <ScrollToTop />
      <ChatBot/>
      <Footer />
    </div>
  )
}

export default App
import { useContext, useEffect , React } from 'react'
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

const App = () => {
  const [{ themeName }] = useContext(ThemeContext)

  useEffect(() => {
    // Get all link elements
    const links = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
    
    // Update each icon reference
    links.forEach(link => {
      const newIcon = themeName === 'light' 
        ? link.dataset.light 
        : link.dataset.dark;
      const newUrl = `${process.env.PUBLIC_URL}/${newIcon}?v=${Date.now()}`;
      
      // Only update if changed
      if (link.href !== newUrl) {
        link.href = newUrl;
      }
      
      // Force refresh by changing URL
      link.setAttribute('href', `${process.env.PUBLIC_URL}/favicon-${themeName}.ico?${Date.now()}`);
    });
  }, [themeName]);

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
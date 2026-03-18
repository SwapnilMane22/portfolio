import { useContext, useEffect , React } from 'react';
import { ThemeContext } from './contexts/theme';
import Header from './components/Header/Header';
import About from './components/About/About';
import ChatBot from './components/ChatBot/ChatBot';
import Journey from './components/Journey/Journey';
import Projects from './components/Projects/Projects';
import Skills from './components/Skills/Skills';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import SectionReveal from './components/SectionReveal/SectionReveal';
import ScrollProgress from './components/ScrollProgress/ScrollProgress';
import Timeline from './components/Timeline/Timeline';
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground';
import './App.css';

const App = () => {
  // const [{ themeName }] = useContext(ThemeContext);
  const contextValue = useContext(ThemeContext) || [{ themeName: 'dark' }];
  const [{ themeName }] = contextValue;

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
      <AnimatedBackground />
      <ScrollProgress />
      <Header />

      <main>
        {/* <Home/> */}
        <SectionReveal>
          <About />
        </SectionReveal>
        <SectionReveal>
          <Journey/>
        </SectionReveal>
        <SectionReveal>
          <Timeline />
        </SectionReveal>
        <SectionReveal>
          <Projects />
        </SectionReveal>
        <SectionReveal>
          <Skills />
        </SectionReveal>
        <SectionReveal className="section-reveal--last">
          <Contact />
        </SectionReveal>
      </main>

      <ScrollToTop />
      <ChatBot/>
      <Footer />
    </div>
  )
}

export default App
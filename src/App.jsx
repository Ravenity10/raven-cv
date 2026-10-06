import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { ui } from './data/profile.js';
import { useSmoothScroll } from './hooks/useSmoothScroll.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Projects from './components/Projects.jsx';
import Experience from './components/Experience.jsx';
import Services from './components/Services.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  useSmoothScroll();

  return (
    // LazyMotion + `m` components keep the animation bundle small.
    // reducedMotion="user": transform animations are skipped when the OS asks for less motion.
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        {ui.skipLink}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Services />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
    </LazyMotion>
  );
}

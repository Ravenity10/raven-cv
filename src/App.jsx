import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { ui } from './data/profile.js';
import { useSmoothScroll } from './hooks/useSmoothScroll.js';
import { usePointerGlow } from './hooks/usePointerGlow.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Projects from './components/Projects.jsx';
import Experience from './components/Experience.jsx';
import Services from './components/Services.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Cursor from './components/Cursor.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  useSmoothScroll();
  usePointerGlow();

  return (
    // LazyMotion + `m` components keep the animation bundle small.
    // reducedMotion="user": transform animations are skipped when the OS asks for less motion.
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
      {/* Fixed backdrop behind every section: grid lines and drifting colour orbs (index.css). */}
      <div aria-hidden="true" className="page-bg">
        <div className="page-bg-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
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
      <Toast />
      <Cursor />
    </MotionConfig>
    </LazyMotion>
  );
}

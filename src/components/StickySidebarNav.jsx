'use client';

import { useEffect, useState } from 'react';
import styles from './StickySidebarNav.module.css';

export default function StickySidebarNav({ sections }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveId(sections[i].id);
          return;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100, // Offset for sticky headers
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className={styles.sidebar}>
      <h3 className={styles.title}>Contents</h3>
      <ul className={styles.navList}>
        {sections.map((section) => (
          <li key={section.id} className={styles.navItem}>
            <a 
              href={`#${section.id}`}
              className={`${styles.navLink} ${activeId === section.id ? styles.active : ''}`}
              onClick={(e) => scrollToSection(e, section.id)}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

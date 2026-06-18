'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Accordion.module.css';

export default function Accordion({ items }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleItem = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={styles.accordion}>
      {items.map((item, index) => {
        const isActive = activeIndex === index;
        return (
          <div 
            key={index} 
            className={`${styles.item} ${isActive ? styles.active : ''}`}
          >
            <button 
              className={styles.header} 
              onClick={() => toggleItem(index)}
              aria-expanded={isActive}
            >
              <span className={styles.title}>{item.question || item.title}</span>
              <span className={styles.icon}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div 
              className={styles.contentWrapper}
              style={{ maxHeight: isActive ? '1000px' : '0' }}
            >
              <div className={styles.content}>
                {item.answer || item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { generateWhatsAppMessage, trackWhatsAppClick } from '../utils/whatsapp';
import styles from './WhatsAppButton.module.css';
import { useEffect, useRef } from 'react';

export default function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith('/admin')) return null;

  const wrapperRef = useRef(null);

  // Drag logic – click‑and‑drag the floating button
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    let offsetX = 0,
        offsetY = 0,
        isDown = false;

    const onMouseDown = (e) => {
      isDown = true;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      e.preventDefault();
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;
    };
    const onMouseUp = () => (isDown = false);

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleClick = () => {
    // Only tracking, navigation handled by the anchor
    trackWhatsAppClick({ url: window.location.href });
  };

  const whatsappUrl = generateWhatsAppMessage({});

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{ cursor: 'grab' }}
    >
      <a
        href={whatsappUrl}
        className={styles.whatsappFloat}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onClick={handleClick}
        title="Chat with us on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="35" height="35" fill="currentColor">
          <path d="M12.031 0C5.398 0 0 5.4 0 12.031c0 2.628.847 5.08 2.316 7.112l-1.554 5.674 5.815-1.526A11.972 11.972 0 0012.031 24c6.632 0 12.031-5.399 12.031-12.031S18.663 0 12.031 0zm6.544 17.33c-.276.78-1.597 1.488-2.203 1.542-.562.05-1.288.196-4.103-1.002-3.567-1.517-5.836-5.143-6.012-5.378-.176-.235-1.436-1.913-1.436-3.649 0-1.737.91-2.585 1.233-2.922.321-.337.7-.421.935-.421.235 0 .47.001.675.011.213.01.498-.083.778.591.293.704.996 2.428 1.084 2.604.088.176.147.382.029.617-.118.235-.176.381-.352.587-.176.205-.371.442-.528.587-.176.162-.364.337-.164.689.199.352.887 1.474 1.91 2.385 1.315 1.171 2.41 1.534 2.763 1.696.352.162.558.147.763-.088.205-.235.887-1.026 1.122-1.378.235-.352.47-.293.793-.176.323.118 2.052.968 2.404 1.144.352.176.587.264.675.411.088.147.088.851-.188 1.631z" />
        </svg>
      </a>
      <span className={styles.tooltip}>Chat with us on WhatsApp</span>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './FaqButton.module.css';
import { useEffect, useRef } from 'react';

export default function FaqButton() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith('/admin')) return null;

  const wrapperRef = useRef(null);

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

    // Touch equivalents
    const onTouchStart = (e) => {
      isDown = true;
      const touch = e.touches[0];
      offsetX = touch.clientX - el.offsetLeft;
      offsetY = touch.clientY - el.offsetTop;
      e.preventDefault();
    };
    const onTouchMove = (e) => {
      if (!isDown) return;
      const touch = e.touches[0];
      el.style.left = `${touch.clientX - offsetX}px`;
      el.style.top = `${touch.clientY - offsetY}px`;
    };
    const onTouchEnd = () => (isDown = false);

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{ cursor: 'grab' }}
    >
      <Link
        href="/account?tab=support"
        className={styles.faqFloat}
        aria-label="Support / Help Center"
        title="Support / Help Center"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        </svg>
      </Link>
      <span className={styles.tooltip}>Support/Help center</span>
    </div>
  );
}

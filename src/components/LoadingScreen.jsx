'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoadingScreen({ isAppReady }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0B0B0B',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: isAppReady ? 0 : 1,
        pointerEvents: isAppReady ? 'none' : 'auto',
        transition: 'opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div style={{ position: 'relative', overflow: 'hidden', padding: '10px 20px' }}>
          <Image
          src="/logo-horizontal-v2.png"
          alt="Downtown Boutique"
          width={240}
          height={60}
          style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.8 }}
          priority
        />
        {/* Shimmer Effect */}
        <motion.div
          initial={{ x: '-150%' }}
          animate={{ x: '150%' }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.2
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(201, 168, 106, 0.5) 50%, transparent 100%)',
            transform: 'skewX(-20deg)',
          }}
        />
      </div>

      {/* Elegant Loading Bar */}
      <div style={{ marginTop: '30px', width: '150px', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, #C9A86A 50%, transparent 100%)',
          }}
        />
        </div>
      </motion.div>
    </div>
  );
}

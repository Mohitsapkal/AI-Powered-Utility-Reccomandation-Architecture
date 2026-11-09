'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface MotionFadeInProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  viewportOnce?: boolean;
}

export function MotionFadeIn({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.5,
  viewportOnce = true,
  className = '',
  style,
  ...props
}: MotionFadeInProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: 24, x: 0 };
      case 'down':
        return { y: -24, x: 0 };
      case 'left':
        return { x: 24, y: 0 };
      case 'right':
        return { x: -24, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      initial={{ opacity: 0, ...initialPos }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: viewportOnce, margin: '-40px' }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionHoverCard({
  children,
  className = '',
  style,
  ...props
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      whileTap={{ scale: 0.99 }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}


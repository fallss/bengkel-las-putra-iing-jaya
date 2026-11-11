'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BounceHeadingProps {
  text: string;
  highlightWords?: string[];
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  shimmerColor?: 'gold' | 'blue';
  showSpark?: boolean;
}

export function BounceHeading({
  text,
  highlightWords = [],
  className = '',
  as = 'h2',
  shimmerColor = 'blue',
  showSpark = true,
}: BounceHeadingProps) {
  const words = text.split(' ');
  const Tag = as;

  // Stagger container
  const containerVariants = {
    hidden: { opacity: 0.8 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0,
      },
    },
  };

  // Snappy spring bounce variant - Starts with safe visibility
  const wordVariants = {
    hidden: {
      opacity: 0.4,
      y: 12,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 450,
        damping: 20,
        mass: 0.5,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      className="inline-block"
    >
      <Tag className={`relative inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${className}`}>
        {words.map((word, idx) => {
          const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const isHighlighted = highlightWords.some((hw) =>
            cleanWord.includes(hw.toLowerCase())
          );

          return (
            <motion.span
              key={idx}
              variants={wordVariants}
              className={`inline-block transform-gpu ${
                isHighlighted
                  ? shimmerColor === 'gold'
                    ? 'weld-spark-gold font-extrabold'
                    : 'weld-spark-blue font-extrabold'
                  : ''
              }`}
            >
              {word}
            </motion.span>
          );
        })}

        {showSpark && (
          <motion.span
            variants={wordVariants}
            className="inline-flex items-center ml-1 text-sky-400 spark-sparkle select-none pointer-events-none align-middle"
          >
            <svg
              className="w-5 h-5 fill-current drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
              viewBox="0 0 24 24"
            >
              <path d="M12 0l2.8 9.2L24 12l-9.2 2.8L12 24l-2.8-9.2L0 12l9.2-2.8z" />
            </svg>
          </motion.span>
        )}
      </Tag>
    </motion.div>
  );
}

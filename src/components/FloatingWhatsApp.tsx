'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, MessageCircle } from 'lucide-react';
import { COMPANY_INFO } from '@/data/content';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-[950] flex items-center space-x-3">
      {/* Floating Button with WA link */}
      <motion.a
        href={COMPANY_INFO.waLink}
        target="_blank"
        rel="noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 border-2 border-white group cursor-pointer relative"
        title="Whatsapp Kami"
      >
        <MessageCircle className="w-7 h-7 fill-white stroke-[2]" />
      </motion.a>

      {/* Tooltip bubble matching original */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="bg-black/90 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg relative flex items-center space-x-2"
          >
            <span>Whatsapp</span>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-slate-400 hover:text-white p-0.5"
              aria-label="Tutup"
            >
              <X className="w-3 h-3" />
            </button>
            {/* Arrow on left */}
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-black/90 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

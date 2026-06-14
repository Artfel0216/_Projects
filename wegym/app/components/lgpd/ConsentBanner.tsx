"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const LGPD_CONSENT_KEY = 'wegym_lgpd_consent';

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(LGPD_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(LGPD_CONSENT_KEY, new Date().toISOString());
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-200 p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 space-y-2">
              <p className="text-sm font-black uppercase italic text-white">
                🛡️ Privacidade e Cookies
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Utilizamos cookies essenciais para garantir o funcionamento da plataforma e tratamos seus dados conforme a{' '}
                <strong className="text-orange-500">LGPD</strong>.
                Ao continuar, você concorda com nossa{' '}
                <Link
                  href="/PrivacyPage"
                  className="text-orange-500 underline hover:text-orange-400"
                  onClick={() => localStorage.setItem(LGPD_CONSENT_KEY, new Date().toISOString())}
                >
                  Política de Privacidade
                </Link>.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/PrivacyPage"
                className="text-xs text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
                onClick={() => localStorage.setItem(LGPD_CONSENT_KEY, new Date().toISOString())}
              >
                Saiba mais
              </Link>
              <button
                type="button"
                onClick={accept}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase italic rounded-xl transition-colors cursor-pointer"
              >
                Aceitar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

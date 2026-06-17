"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/hook';

export default function PrivacyPage() {
  const router = useRouter();
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 font-sans antialiased">
      <header className="sticky top-0 z-40 bg-zinc-950/40 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4 pl-16 lg:pl-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <Shield size={20} className="text-orange-500" />
        <h1 className="text-lg font-black italic uppercase">{t('privacy.title')}</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">{t('privacy.section1Title')}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('privacy.section1Body')}
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Ao criar uma conta e utilizar a plataforma WEGYM, você consente com as práticas descritas nesta política.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">{t('privacy.section2Title')}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('privacy.section2Body')}
          </p>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1 leading-relaxed">
            <li>{t('privacy.section2List1')}</li>
            <li>{t('privacy.section2List2')}</li>
            <li>{t('privacy.section2List3')}</li>
            <li>{t('privacy.section2List4')}</li>
            <li>{t('privacy.section2List5')}</li>
            <li>{t('privacy.section2List6')}</li>
            <li>{t('privacy.section2List7')}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">{t('privacy.section3Title')}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('privacy.section3Body')}
          </p>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1 leading-relaxed">
            <li>{t('privacy.section3List1')}</li>
            <li>{t('privacy.section3List2')}</li>
            <li>{t('privacy.section3List3')}</li>
            <li>{t('privacy.section3List4')}</li>
            <li>{t('privacy.section3List5')}</li>
            <li>{t('privacy.section3List6')}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">{t('privacy.section4Title')}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('privacy.section4Body')}
          </p>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1 leading-relaxed">
            <li>Quando necessário para cumprir obrigação legal ou regulatória</li>
            <li>Com seu consentimento explícito</li>
            <li>Com personal trainers vinculados (apenas dados de treino dos atletas)</li>
            <li>Processadores de pagamento (Mercado Pago) para transações</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">{t('privacy.section5Title')}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('privacy.section5Body')}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">{t('privacy.section6Title')}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('privacy.section6Body')}
          </p>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1 leading-relaxed">
            <li>Confirmar a existência de tratamento de dados</li>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
            <li>Solicitar a portabilidade dos dados</li>
            <li>Eliminar os dados tratados com seu consentimento</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>
          <p className="text-sm text-zinc-400 leading-relaxed mt-2">
            Para exercer seus direitos, acesse as opções disponíveis no seu perfil ou entre em contato pelo e-mail: privacidade@wegym.com.br
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">{t('privacy.section7Title')}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('privacy.section7Body')}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">{t('privacy.section8Title')}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('privacy.section8Body')}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">{t('privacy.section9Title')}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('privacy.section9Body')}
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            E-mail: privacidade@wegym.com.br<br />
            Encarregado (DPO): dpo@wegym.com.br
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">{t('privacy.section10Title')}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('privacy.section10Body')}
          </p>
          <p className="text-sm text-zinc-500 leading-relaxed pt-2 border-t border-white/5">
            {t('privacy.lastUpdated')}
          </p>
        </section>
      </main>
    </div>
  );
}

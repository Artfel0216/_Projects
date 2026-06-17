"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  const router = useRouter();

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
        <h1 className="text-lg font-black italic uppercase">Política de Privacidade</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">1. Introdução</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            A WEGYM valoriza a privacidade dos seus usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Ao criar uma conta e utilizar a plataforma WEGYM, você consente com as práticas descritas nesta política.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">2. Dados Coletados</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Coletamos os seguintes dados pessoais durante o cadastro e uso da plataforma:
          </p>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1 leading-relaxed">
            <li>Nome completo, e-mail e senha (criptografada)</li>
            <li>CPF, CEP, cidade e estado</li>
            <li>Idade, sexo, altura, peso e nível de experiência</li>
            <li>Informações de saúde (lesões, problemas de saúde, medicamentos)</li>
            <li>Número CREF (para personal trainers)</li>
            <li>Dados de treino, progresso e desempenho</li>
            <li>Dados de conexão Bluetooth (frequência cardíaca)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">3. Finalidade do Tratamento</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Seus dados são utilizados para as seguintes finalidades:
          </p>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1 leading-relaxed">
            <li>Criação e gerenciamento da sua conta</li>
            <li>Personalização de planos de treino</li>
            <li>Acompanhamento de desempenho e progresso</li>
            <li>Geração de relatórios e estatísticas</li>
            <li>Comunicação sobre atualizações e funcionalidades</li>
            <li>Melhoria contínua dos serviços oferecidos</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">4. Compartilhamento de Dados</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Seus dados pessoais não são vendidos ou compartilhados com terceiros, exceto:
          </p>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1 leading-relaxed">
            <li>Quando necessário para cumprir obrigação legal ou regulatória</li>
            <li>Com seu consentimento explícito</li>
            <li>Com personal trainers vinculados (apenas dados de treino dos atletas)</li>
            <li>Processadores de pagamento (Mercado Pago) para transações</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">5. Armazenamento e Segurança</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Seus dados são armazenados em servidores seguros com criptografia. A senha é armazenada utilizando hash bcrypt. Implementamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou destruição.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">6. Seus Direitos (LGPD)</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Conforme a LGPD, você possui os seguintes direitos:
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
          <h2 className="text-sm font-black uppercase italic text-orange-500">7. Cookies</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Utilizamos cookies essenciais para o funcionamento da plataforma, incluindo cookies de autenticação de sessão. Estes cookies são necessários para manter você logado e garantir a segurança da sua conta. Não utilizamos cookies de rastreamento ou publicidade sem seu consentimento.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">8. Exclusão de Conta</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Você pode solicitar a exclusão da sua conta a qualquer momento através da opção disponível no seu perfil. Após a solicitação, seus dados serão anonimizados e não poderão ser recuperados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">9. Contato</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Para questões relacionadas à privacidade e proteção de dados, entre em contato conosco:
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            E-mail: privacidade@wegym.com.br<br />
            Encarregado (DPO): dpo@wegym.com.br
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase italic text-orange-500">10. Alterações nesta Política</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Reservamo-nos o direito de modificar esta política a qualquer momento. Alterações significativas serão comunicadas através da plataforma ou por e-mail. Recomendamos revisar esta página periodicamente.
          </p>
          <p className="text-sm text-zinc-500 leading-relaxed pt-2 border-t border-white/5">
            Última atualização: Junho de 2026
          </p>
        </section>
      </main>
    </div>
  );
}

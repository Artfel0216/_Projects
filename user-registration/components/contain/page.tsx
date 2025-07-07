'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Google from '@/public/img/Google.png';
import Facebook from '@/public/img/Facebook.png';
import LoginArt from '@/public/img/Login Art.png';

export default function Contain() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const currentData = { email, password };
    const saved = JSON.parse(localStorage.getItem('logins') || '[]');
    saved.push(currentData);
    localStorage.setItem('logins', JSON.stringify(saved));

    console.log('Login salvo no LocalStorage!');
  };

  const handleClick = () => {
    handleLogin();
    router.push('/inbox');
  };

  return (
    <main className="relative pl-25 pt-8">
      {/* Cabeçalho de boas-vindas */}
      <header>
        <h1 className="text-[#0C1421] font-bold text-2xl">Welcome 👋</h1>
        <p className="text-[#313957] text-base mt-4">
          Today is a new day. It's your day. You shape it. <br />
          Sign in to start managing your projects.
        </p>
      </header>

      {/* Formulário de login */}
      <form onSubmit={(e) => e.preventDefault()} className="mt-6" aria-label="Login Form">
        <div>
          <label htmlFor="email" className="block text-[#0C1421] font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-[20rem] p-3 mt-2 text-black bg-white border-2 border-black rounded"
            required
          />
        </div>

        <div className="mt-4">
          <label htmlFor="password" className="block text-[#0C1421] font-semibold">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-[20rem] p-3 mt-2 text-black bg-white border-2 border-black rounded"
            required
            minLength={8}
          />
        </div>

        <div className="w-[20rem] flex justify-end mt-2">
          <a href="#" className="text-[#1E4AE9] text-sm hover:underline">
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          onClick={handleClick}
          className="w-[20rem] h-12 mt-4 bg-[#162D3A] text-white rounded flex items-center justify-center hover:opacity-90"
        >
          Sign in
        </button>
      </form>

      {/* Botões sociais */}
      <section className="mt-6" aria-label="Login com redes sociais">
        <button className="w-[20rem] h-12 border-2 border-black bg-white text-[#313957] rounded flex items-center justify-center gap-3 hover:bg-gray-100">
          <img src={Google.src} alt="Google Logo" className="w-5 h-5" />
          Sign in with Google
        </button>

        <button className="w-[20rem] h-12 mt-4 border-2 border-black bg-white text-[#313957] rounded flex items-center justify-center gap-3 hover:bg-gray-100">
          <img src={Facebook.src} alt="Facebook Logo" className="w-5 h-5" />
          Sign in with Facebook
        </button>
      </section>

      {/* Ilustração decorativa */}
      <img
        src={LoginArt.src}
        alt="Ilustração de login"
        className="absolute z-10 top-0 right-0 w-[29rem] h-[35rem] mr-[6rem] mt-[2rem] animate-fade-down animate-twice animate-duration-[3000ms] animate-delay-1000"
      />
    </main>
  );
}

'use client';

import { useState } from 'react';
import Google from '@/public/img/Google.png';
import Facebook from '@/public/img/Facebook.png';
import LoginArt from '@/public/img/Login Art.png';

export default function Contain() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const currentData = {
      email,
      password,
    };

    // Recupera os dados já salvos ou inicia com um array vazio
    const saved = JSON.parse(localStorage.getItem('logins') || '[]');

    // Adiciona o novo login ao array
    saved.push(currentData);

    // Salva de volta no localStorage
    localStorage.setItem('logins', JSON.stringify(saved));

    alert('Login salvo no localStorage!');
  };

  return (
    <div className="pl-25 pt-8 relative">
      <h1 className="text-[#0C1421] font-bold text-2xl">Welcome 👋</h1>

      <p className="text-[#313957] text-base mt-4">
        Today is a new day. It's your day. You shape it. <br />
        Sign in to start managing your projects.
      </p>

      <label className="block text-[#0C1421] font-semibold mt-6" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@email.com"
        className="w-[20rem] p-3 mt-2 text-black bg-white border-2 border-black rounded"
      />

      <label className="block text-[#0C1421] font-semibold mt-4" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 8 characters"
        className="w-[20rem] p-3 mt-2 text-black bg-white border-2 border-black rounded"
      />

      <div className="w-[20rem] flex justify-end mt-2">
        <a href="#" className="text-[#1E4AE9] text-sm hover:underline">
          Forgot Password?
        </a>
      </div>

      <button
        onClick={handleLogin}
        className="w-[20rem] h-12 mt-4 bg-[#162D3A] cursor-pointer text-white rounded flex items-center justify-center hover:opacity-90"
      >
        Sign in
      </button>

      <button className="w-[20rem] h-12 mt-6 border-2 cursor-pointer border-black bg-white text-[#313957] rounded flex items-center justify-center gap-3 hover:bg-gray-100">
        <img src={Google.src} alt="Google Logo" className="w-5 h-5" />
        Sign in with Google
      </button>

      <button className="w-[20rem] h-12 mt-4 border-2 cursor-pointer border-black bg-white text-[#313957] rounded flex items-center justify-center gap-3 hover:bg-gray-100">
        <img src={Facebook.src} alt="Facebook Logo" className="w-5 h-5" />
        Sign in with Facebook
      </button>

      <img
        src={LoginArt.src}
        alt=""
        className="absolute z-10 top-0 right-0 w-[29rem] h-[35rem] mr-[6rem] mt-[2rem] animate-fade-down animate-twice animate-duration-[3000ms] animate-delay-1000"
      />
    </div>
  );
}

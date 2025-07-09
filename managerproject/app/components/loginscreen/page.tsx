'use client';

import { useRouter } from 'next/navigation';
import GoogleLogo from '../../../public/Google.png';
import FacebookLogo from '../../../public/Facebook.png';
import LoginArt from '../../../public/LoginArt.png';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // prevents page reloading
    router.push('/dashboard');
  };

  return (
    <main className="w-full h-screen flex font-bold">
      
      {/* Form section */}
      <section className="flex flex-col p-10 w-1/2" aria-labelledby="login-heading">
        <h1 id="login-heading" className="text-[2rem]">
          Welcome, Arthur Fellipe!
        </h1>

        <form onSubmit={handleLogin} className="mt-8">
          <div className="mb-6">
            <label htmlFor="email" className="block text-[1.6rem] mb-2">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="Informe o seu E-mail"
              className="w-[20rem] h-[3rem] p-4 border border-black rounded text-black font-semibold cursor-pointer"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-[1.6rem] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Informe a sua senha"
              className="w-[20rem] h-[3rem] p-4 border border-black rounded text-black font-semibold cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-[20rem] h-[3rem] flex justify-center items-center bg-black text-white rounded cursor-pointer"
          >
            Sign in
          </button>
        </form>

        {/* Social buttons */}
        <div className="mt-6 space-y-4" aria-label="Outras formas de login">
          <button className="flex items-center justify-center w-[20rem] h-[3rem] bg-white border border-black rounded text-black font-bold cursor-pointer">
            <img src={GoogleLogo.src} alt="Google logo" />
            <span className="ml-2">Sign in with Google</span>
          </button>

          <button className="flex items-center justify-center w-[20rem] h-[3rem] bg-white border border-black rounded text-black font-bold cursor-pointer">
            <img src={FacebookLogo.src} alt="Facebook logo" />
            <span className="ml-2">Sign in with Facebook</span>
          </button>
        </div>
      </section>

      {/* illustrative image */}
      <aside className="w-1/2 flex justify-center items-center" aria-hidden="true">
        <img src={LoginArt.src} alt="Ilustração de login" className="w-[30rem] h-[35rem]" />
      </aside>
    </main>
  );
}

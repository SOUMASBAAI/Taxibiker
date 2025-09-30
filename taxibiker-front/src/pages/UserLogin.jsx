import { useState } from "react";
import Header from "../components/Header";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;

    if (!emailRegex.test(email)) return setError("Email invalide");
    if (!passwordRegex.test(password)) return setError("Mot de passe invalide");

    setError("");
    alert("Connexion réussie !");
    // Ici tu peux envoyer les données au backend
  };

  return (
     <>
          <Header />
    
    <main className="min-h-screen bg-black flex items-center justify-center">
      <section
        aria-labelledby="login-title"
        className="bg-[#242424] p-8 rounded-lg flex flex-col gap-4 w-96"
      >
        <header>
          <h1
            id="login-title"
            className="text-white text-2xl font-bold text-center mb-4"
          >
            Connexion utilisateur
          </h1>
        </header>

        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="email" className="flex flex-col text-white text-sm">
            Email
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="p-3 rounded bg-white text-black placeholder-black focus:outline-none"
              required
            />
          </label>

          <label htmlFor="password" className="flex flex-col text-white text-sm">
            Mot de passe
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="p-3 rounded bg-white text-black placeholder-black focus:outline-none"
              required
            />
          </label>

          <button
            type="submit"
            className="bg-[#DD5212] text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            Se connecter
          </button>
        </form>

        <footer>
          <a
            href="#"
            className="text-orange-400 text-sm text-center hover:underline mt-2 block"
          >
            Mot de passe oublié ?
          </a>
        </footer>
      </section>
    </main>
    </>
  );
}

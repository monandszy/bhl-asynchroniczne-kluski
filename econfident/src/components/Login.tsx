import { useState, type FormEvent } from "react";

interface LoginProps {
  onLogin: (isAdmin: boolean) => void;
}

function Login({ onLogin }: LoginProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://econfidentapi.mateusz-zdr.dev/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ login, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onLogin(data.isAdmin || false);
      } else {
        setError("Nieprawidłowy login lub hasło");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Nie udało się połączyć z serwerem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[wheat] flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-green-900 to-[#308c16] rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-white text-3xl font-bold mb-2 text-center">
          ECOnfident
        </h2>
        <p className="text-white/90 text-sm italic text-center mb-6">
          Ekologia zaczyna się od odwagi
        </p>
        <p className="text-white text-center mb-6">
          Zaloguj się, aby kontynuować
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="login"
              className="block text-white text-sm font-medium mb-2"
            >
              Login
            </label>
            <input
              type="text"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              placeholder="Wprowadź login"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-white text-sm font-medium mb-2"
            >
              Hasło
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              placeholder="Wprowadź hasło"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-green-900 font-bold text-lg px-6 py-4 rounded-lg hover:bg-green-50 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

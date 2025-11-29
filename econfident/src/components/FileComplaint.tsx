import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

function FileComplaint() {
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      title: formData.get("title") as string,
      descr: formData.get("descr") as string,
      info: formData.get("info") as string,
      cats: formData.get("cats") as string,
    };

    try {
      const response = await fetch("http://localhost:3000/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        alert("Błąd podczas wysyłania zgłoszenia");
        return;
      }

      setShowSuccess(true);
      form.reset();

      setTimeout(() => {
        navigate("/feed");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      alert("Nie udało się połączyć z serwerem");
    }
  };

  return (
    <>
      <div className="mx-auto w-full sm:w-4/5 md:w-3/4 lg:w-2/4 mt-8 mb-8 relative">
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 border-4 border-green-600">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  Zgłoszenie wysłane!
                </h3>
                <p className="text-gray-600 text-center">
                  Twoje zgłoszenie zostało pomyślnie przesłane
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className={`bg-gradient-to-br from-green-900 to-[#308c16] rounded-lg shadow-2xl p-8 ${
            showSuccess ? "blur-sm" : ""
          }`}
        >
          <h2 className="text-white text-2xl font-bold mb-6 text-center">
            Zgłoś incydent
          </h2>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="title"
                className="block text-white text-sm font-medium mb-2"
              >
                Tytuł
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                placeholder="Wprowadź tytuł zgłoszenia"
              />
            </div>

            <div>
              <label
                htmlFor="descr"
                className="block text-white text-sm font-medium mb-2"
              >
                Opis
              </label>
              <textarea
                id="descr"
                name="descr"
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition resize-none"
                placeholder="Opisz swoje zgłoszenie..."
              />
            </div>

            <div>
              <label
                htmlFor="info"
                className="block text-white text-sm font-medium mb-2"
              >
                Informacje
              </label>
              <input
                type="text"
                id="info"
                name="info"
                className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                placeholder="Dodatkowe informacje"
              />
            </div>

            <div>
              <label
                htmlFor="cats"
                className="block text-white text-sm font-medium mb-2"
              >
                Kategoria
              </label>
              <select
                id="cats"
                name="cats"
                className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              >
                <option value="">Wybierz kategorię</option>
                <option value="Środowisko">Środowisko</option>
                <option value="Gospodarka odpadami">Gospodarka odpadami</option>
                <option value="Śmiecenie">Śmiecenie</option>
                <option value="Zanieczyszczanie powietrza">
                  Zanieczyszczanie powietrza
                </option>
                <option value="Zanieczyszczanie wody">
                  Zanieczyszczanie wody
                </option>
                <option value="Niszczenie zieleni">Niszczenie zieleni</option>
                <option value="Inne">Inne</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-green-900 font-bold text-lg px-6 py-4 rounded-lg hover:bg-green-50 active:scale-[0.98] transition-all shadow-lg mt-2"
            >
              Wyślij zgłoszenie
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
export default FileComplaint;

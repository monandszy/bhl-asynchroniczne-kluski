import { useEffect, useState, useRef, useCallback } from "react";

interface Complaint {
  id: number;
  title: string;
  descr: string;
  info: string;
  cats: string;
  admin_response: string | null;
}

function Feed() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const isFetching = useRef(false);
  const lastComplaintRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching.current) {
          setOffset((prev) => prev + 10);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    fetchComplaints();
  }, [offset]);

  const fetchComplaints = async () => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/complaints?offset=${offset}&limit=10`
      );
      if (!response.ok) {
        throw new Error("Nie udało się pobrać zgłoszeń");
      }
      const data = await response.json();

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setComplaints((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newComplaints = data.filter(
            (c: Complaint) => !existingIds.has(c.id)
          );
          return [...prev, ...newComplaints];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nieznany błąd");
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-xl font-semibold">Błąd: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-green-900 mb-8 text-center">
        Kanał zgłoszeń
      </h1>

      {complaints.length === 0 && !loading ? (
        <div className="text-center text-gray-500 text-xl">
          Brak zgłoszeń. Bądź pierwszym, który zgłosi problem!
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {complaints.map((complaint, index) => {
            if (complaints.length === index + 1) {
              return (
                <div
                  key={complaint.id}
                  ref={lastComplaintRef}
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-[#308c16]"
                >
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <h2 className="text-2xl font-bold text-green-900">
                      {complaint.title}
                    </h2>
                    <span className="bg-[#308c16] text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0">
                      {complaint.cats}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                    {complaint.descr}
                  </p>

                  <div className="flex items-center text-gray-600 text-sm">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">Informacje:</span>
                    <span className="ml-2">{complaint.info}</span>
                  </div>

                  {complaint.admin_response && (
                    <div className="mt-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            Odpowiedź administratora:
                          </p>
                          <p className="text-blue-800">
                            {complaint.admin_response}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <div
                  key={complaint.id}
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-[#308c16]"
                >
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <h2 className="text-2xl font-bold text-green-900">
                      {complaint.title}
                    </h2>
                    <span className="bg-[#308c16] text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0">
                      {complaint.cats}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                    {complaint.descr}
                  </p>

                  <div className="flex items-center text-gray-600 text-sm">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">Informacje:</span>
                    <span className="ml-2">{complaint.info}</span>
                  </div>

                  {complaint.admin_response && (
                    <div className="mt-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            Odpowiedź administratora:
                          </p>
                          <p className="text-blue-800">
                            {complaint.admin_response}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          })}

          {loading && (
            <div className="text-center text-green-900 text-lg font-semibold py-4">
              Ładowanie więcej zgłoszeń...
            </div>
          )}

          {!hasMore && complaints.length > 0 && (
            <div className="text-center text-gray-500 text-lg py-4">
              To wszystkie zgłoszenia
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Feed;

import { useEffect, useState } from "react";

interface Complaint {
  id: number;
  title: string;
  descr: string;
  info: string;
  cats: string;
  admin_response: string | null;
}

interface User {
  id: number;
  login: string;
  admin: boolean;
}

function AdminPanel() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"complaints" | "users">(
    "complaints"
  );
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    login: "",
    password: "",
    admin: false,
  });
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    if (activeTab === "complaints") {
      fetchComplaints();
    } else if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/complaints?limit=100"
      );
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.login || !newUser.password) {
      alert("Login i hasło są wymagane");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        alert("Użytkownik został dodany");
        setNewUser({ login: "", password: "", admin: false });
        setShowAddUser(false);
        fetchUsers();
      } else {
        alert("Błąd podczas dodawania użytkownika");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Nie udało się połączyć z serwerem");
    }
  };

  const handleDeleteUser = async (userId: number, userLogin: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${userLogin}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Użytkownik został usunięty");
        fetchUsers();
      } else {
        alert("Błąd podczas usuwania użytkownika");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Nie udało się połączyć z serwerem");
    }
  };

  const handleSubmitResponse = async (complaintId: number) => {
    if (!responseText.trim()) {
      alert("Odpowiedź nie może być pusta");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/complaints/${complaintId}/response`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ admin_response: responseText }),
        }
      );

      if (response.ok) {
        alert("Odpowiedź została dodana");
        setRespondingTo(null);
        setResponseText("");
        fetchComplaints();
      } else {
        alert("Błąd podczas dodawania odpowiedzi");
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      alert("Nie udało się połączyć z serwerem");
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === complaints.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(complaints.map((c) => c.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) {
      alert("Nie wybrano żadnych zgłoszeń do usunięcia");
      return;
    }

    if (!confirm(`Czy na pewno chcesz usunąć ${selectedIds.size} zgłoszeń?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch("http://localhost:3000/api/complaints", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (response.ok) {
        alert("Zgłoszenia zostały usunięte");
        setSelectedIds(new Set());
        fetchComplaints();
      } else {
        alert("Błąd podczas usuwania zgłoszeń");
      }
    } catch (error) {
      console.error("Error deleting complaints:", error);
      alert("Nie udało się połączyć z serwerem");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-green-900 to-[#308c16] rounded-lg shadow-2xl p-8 mb-6">
          <h1 className="text-white text-4xl font-bold text-center">
            Panel Administratora
          </h1>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("complaints")}
            className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all ${
              activeTab === "complaints"
                ? "bg-gradient-to-br from-green-900 to-[#308c16] text-white shadow-lg"
                : "bg-white text-green-900 border-2 border-green-900 hover:bg-green-50"
            }`}
          >
            Zarządzanie zgłoszeniami
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all ${
              activeTab === "users"
                ? "bg-gradient-to-br from-green-900 to-[#308c16] text-white shadow-lg"
                : "bg-white text-green-900 border-2 border-green-900 hover:bg-green-50"
            }`}
          >
            Zarządzanie użytkownikami
          </button>
        </div>

        {activeTab === "complaints" ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-900">
                Zarządzanie zgłoszeniami
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  {selectedIds.size === complaints.length
                    ? "Odznacz wszystko"
                    : "Zaznacz wszystko"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={selectedIds.size === 0 || deleting}
                  className="bg-red-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Usuwanie..." : `Usuń (${selectedIds.size})`}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-gray-500 py-8">Ładowanie...</div>
            ) : complaints.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Brak zgłoszeń
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedIds.has(complaint.id)
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleSelect(complaint.id)}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(complaint.id)}
                        onChange={() => toggleSelect(complaint.id)}
                        className="mt-1 w-5 h-5 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2 gap-3">
                          <h3 className="text-xl font-bold text-green-900">
                            {complaint.title}
                          </h3>
                          <span className="bg-[#308c16] text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0">
                            {complaint.cats}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{complaint.descr}</p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Informacje:</span>{" "}
                          {complaint.info}
                        </p>

                        {complaint.admin_response ? (
                          <div className="mt-3 bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                              Odpowiedź administratora:
                            </p>
                            <p className="text-sm text-blue-800">
                              {complaint.admin_response}
                            </p>
                          </div>
                        ) : respondingTo === complaint.id ? (
                          <div
                            className="mt-3 space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Wpisz odpowiedź administratora..."
                              className="w-full px-3 py-2 border-2 border-green-600 rounded-lg focus:outline-none focus:border-green-700"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubmitResponse(complaint.id);
                                }}
                                className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 text-sm font-medium"
                              >
                                Wyślij odpowiedź
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRespondingTo(null);
                                  setResponseText("");
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-1 rounded-lg hover:bg-gray-400 text-sm font-medium"
                              >
                                Anuluj
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRespondingTo(complaint.id);
                            }}
                            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            Odpowiedz
                          </button>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                          ID: {complaint.id}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-900">
                Zarządzanie użytkownikami
              </h2>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                {showAddUser ? "Anuluj" : "Dodaj użytkownika"}
              </button>
            </div>

            {showAddUser && (
              <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-green-900 mb-4">
                  Nowy użytkownik
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Login
                    </label>
                    <input
                      type="text"
                      value={newUser.login}
                      onChange={(e) =>
                        setNewUser({ ...newUser, login: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-green-600 focus:outline-none"
                      placeholder="Wprowadź login"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hasło
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-green-600 focus:outline-none"
                      placeholder="Wprowadź hasło"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="admin"
                      checked={newUser.admin}
                      onChange={(e) =>
                        setNewUser({ ...newUser, admin: e.target.checked })
                      }
                      className="w-5 h-5 cursor-pointer"
                    />
                    <label
                      htmlFor="admin"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Administrator
                    </label>
                  </div>
                  <button
                    onClick={handleAddUser}
                    className="w-full bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    Dodaj użytkownika
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center text-gray-500 py-8">Ładowanie...</div>
            ) : users.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Brak użytkowników
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-green-900">
                          {user.login}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          {user.admin && (
                            <span className="bg-[#308c16] text-white px-3 py-1 rounded-full text-sm font-medium">
                              Administrator
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.login)}
                        className="bg-red-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;

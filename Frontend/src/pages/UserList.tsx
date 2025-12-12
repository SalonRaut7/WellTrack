import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

type UserType = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

export default function UserList() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const resp = await api.get("/api/Admin/users");
      setUsers(resp.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Delete this user?")) return;
    await api.delete(`/api/Admin/delete-user?userId=${userId}`);
    loadUsers();
  };

  const assignAdmin = async (userId: string) => {
    await api.post(`/api/Admin/assign-role?userId=${userId}&role=Admin`);
    loadUsers();
  };

  const removeAdmin = async (userId: string) => {
    await api.post(`/api/Admin/remove-role?userId=${userId}&role=Admin`);
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Manage Users</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Roles</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="border px-4 py-2">{u.name}</td>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2">{u.roles.join(", ")}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => navigate(`/admin/user/${u.id}`)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  View
                </button>

                {u.roles.includes("Admin") ? (
                  <button
                    onClick={() => removeAdmin(u.id)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Remove Admin
                  </button>
                ) : (
                  <button
                    onClick={() => assignAdmin(u.id)}
                    className="px-2 py-1 bg-green-600 text-white rounded"
                  >
                    Make Admin
                  </button>
                )}

                <button
                  onClick={() => deleteUser(u.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

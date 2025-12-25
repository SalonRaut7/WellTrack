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

  const roleChipClass = (role: string) => {
    switch ((role || "").toLowerCase()) {
      case "admin":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "user":
        return "border-slate-200 bg-slate-50 text-slate-700";
      default:
        return "border-indigo-200 bg-indigo-50 text-indigo-700";
    }
  };

  const ButtonBase =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition active:scale-[0.99]";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 opacity-15" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Manage Users</h2>
                <p className="mt-1 text-sm text-slate-500">View user profiles and manage roles.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                  Total: {users.length}
                </span>
                <button
                  onClick={loadUsers}
                  className={ButtonBase + " border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="mt-6 h-44 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-sm">
            <div className="text-sm font-semibold">Something went wrong</div>
            <div className="mt-1 text-sm">{error}</div>
          </div>
        )}

        {!loading && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold text-slate-600">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Roles</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="mt-1 text-xs text-slate-500">ID: {u.id}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-800">{u.email}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {u.roles?.length ? (
                            u.roles.map((r) => (
                              <span
                                key={r}
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${roleChipClass(
                                  r
                                )}`}
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">—</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => navigate(`/admin/user/${u.id}`)}
                            className={SmallButtonBase + " border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"}
                          >
                            View
                          </button>

                          {u.roles.includes("Admin") ? (
                            <button
                              onClick={() => removeAdmin(u.id)}
                              className={SmallButtonBase + " border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"}
                            >
                              Remove Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => assignAdmin(u.id)}
                              className={SmallButtonBase + " border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}
                            >
                              Make Admin
                            </button>
                          )}

                          <button
                            onClick={() => deleteUser(u.id)}
                            className={SmallButtonBase + " border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && !error && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
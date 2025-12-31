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
        return "border-amber-400/20 bg-amber-500/10 text-amber-100";
      case "user":
        return "border-white/10 bg-white/10 text-slate-100";
      default:
        return "border-indigo-400/20 bg-indigo-500/10 text-indigo-100";
    }
  };

  const ButtonBase =
    "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";

  const CardBase =
    "rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-sky-500/15 to-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[8%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl p-6">
        <div className={"mb-6 overflow-hidden " + CardBase}>
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(56,189,248,0.14),transparent_50%)]" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Manage Users</h2>
                <p className="mt-1 text-sm text-slate-300">View user profiles and manage roles.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100">
                  Total: {users.length}
                </span>
                <button
                  onClick={loadUsers}
                  className={[
                    ButtonBase,
                    "border border-white/10 bg-white/10 text-slate-100 hover:bg-white/15 hover:-translate-y-[1px]",
                  ].join(" ")}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className={CardBase + " p-6"}>
            <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
            </div>
            <div className="mt-6 h-44 animate-pulse rounded-2xl bg-white/10" />
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-400/20 bg-white/[0.06] p-5 text-rose-200 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="text-sm font-semibold text-white">Something went wrong</div>
            <div className="mt-1 text-sm">{error}</div>
          </div>
        )}

        {!loading && (
          <div className={CardBase + " overflow-hidden"}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/5">
                  <tr className="text-left text-xs font-semibold text-slate-200">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Roles</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="mt-1 text-xs text-slate-300">ID: {u.id}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-100">{u.email}</div>
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
                            <span className="text-sm text-slate-300">—</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => navigate(`/admin/user/${u.id}`)}
                            className={[
                              SmallButtonBase,
                              "border border-indigo-400/20 bg-indigo-500/10 text-indigo-100 hover:bg-indigo-500/15 hover:-translate-y-[1px]",
                            ].join(" ")}
                          >
                            View
                          </button>

                          {u.roles.includes("Admin") ? (
                            <button
                              onClick={() => removeAdmin(u.id)}
                              className={[
                                SmallButtonBase,
                                "border border-amber-400/20 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15 hover:-translate-y-[1px]",
                              ].join(" ")}
                            >
                              Remove Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => assignAdmin(u.id)}
                              className={[
                                SmallButtonBase,
                                "border border-emerald-400/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 hover:-translate-y-[1px]",
                              ].join(" ")}
                            >
                              Make Admin
                            </button>
                          )}

                          <button
                            onClick={() => deleteUser(u.id)}
                            className={[
                              SmallButtonBase,
                              "border border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15 hover:-translate-y-[1px]",
                            ].join(" ")}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && !error && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-300">
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
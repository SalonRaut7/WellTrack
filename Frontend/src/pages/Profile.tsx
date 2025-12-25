import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

type ProfileData = {
  id: string;
  email: string;
  name?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  goals?: string;
  bio?: string;
  profileImageUrl?: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const load = async () => {
      try {
        const meResp = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(meResp.data.roles);

        const profileResp = await api.get("/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(profileResp.data);
        setForm({
          name: profileResp.data.name ?? "",
          age: profileResp.data.age ?? "",
          gender: profileResp.data.gender ?? "",
          weight: profileResp.data.weight ?? "",
          height: profileResp.data.height ?? "",
          goals: profileResp.data.goals ?? "",
          bio: profileResp.data.bio ?? "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isAdmin = roles.includes("Admin");

  const bmi =
    profile?.weight && profile?.height
      ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
      : null;

  const save = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.put(
        "/api/profile",
        {
          Name: form.name || null,
          Age: form.age ? parseInt(form.age) : null,
          Gender: form.gender || null,
          Weight: form.weight ? parseFloat(form.weight) : null,
          Height: form.height ? parseFloat(form.height) : null,
          Goals: form.goals || null,
          Bio: form.bio || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = await api.get("/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(updated.data);
      setEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async () => {
    try {
      await api.delete("/api/profile/photo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile((prev) => (prev ? { ...prev, profileImageUrl: null } : prev));
    } catch (err) {
      setError("Failed to delete photo.");
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const resp = await api.post("/api/profile/photo", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile((prev) =>
        prev ? { ...prev, profileImageUrl: resp.data.profileImageUrl } : prev
      );
    } catch (err) {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("at least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("one uppercase letter");
    if (!/[a-z]/.test(pwd)) errors.push("one lowercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("one number");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pwd)) errors.push("one special character");
    return errors;
  };

  const evaluateStrength = (pwd: string) => {
    if (pwd.length < 6) return "Weak";
    if (/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(pwd)) return "Strong";
    return "Medium";
  };

  const changePassword = async () => {
    setPasswordError(null);
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    const pwdErrors = validatePassword(newPassword);
    if (pwdErrors.length > 0) {
      setPasswordError("New password must contain " + pwdErrors.join(", ") + ".");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.post(
        "/api/profile/change-password",
        { OldPassword: oldPassword, NewPassword: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      alert("Password changed successfully.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors?.join(" | ") || "Failed to change password.");
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const InputBase =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";
  const ButtonBase =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";

  const goBack = () => {
    // IMPORTANT: keep original behavior
    if (isAdmin) navigate("/admin");
    else navigate("/dashboard");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl p-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 flex items-center gap-4">
              <div className="h-24 w-24 animate-pulse rounded-full bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
            <div className="mt-6 h-40 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );

  if (error && !profile)
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl p-6">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-sm">
            <div className="text-sm font-semibold">Something went wrong</div>
            <div className="mt-1 text-sm">{error}</div>
          </div>
        </div>
      </div>
    );

  if (!profile) return null;

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl p-6">
          <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative p-6 sm:p-8">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 opacity-15" />
              <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    Profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Admin account</p>
                </div>

                <button
                  onClick={goBack}
                  className={ButtonBase + " border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"}
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-extrabold text-slate-700">
                    {profile.email[0].toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-xl font-bold text-slate-900">{profile.email}</div>
                <div className="mt-1 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  Admin Account
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  This is an admin account. Personal profile fields are hidden.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-rose-500 opacity-15" />
            <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  Profile
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your personal info and security settings.
                </p>
              </div>

              <button
                onClick={goBack}
                className={ButtonBase + " border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"}
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-sm">
            <div className="text-sm font-semibold">Could not complete request</div>
            <div className="mt-1 text-sm">{error}</div>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-extrabold text-slate-700">
                  {(profile.name || profile.email)[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-2xl font-extrabold tracking-tight text-slate-900">
                {profile.name || profile.email}
              </div>
              <div className="mt-1 text-sm text-slate-600">{profile.email}</div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold">Bio:</span>{" "}
                <span className={profile.bio ? "text-slate-700" : "text-slate-400"}>
                  {profile.bio || "No bio added"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <label
                  className={
                    SmallButtonBase +
                    " border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 cursor-pointer"
                  }
                >
                  {uploading ? "Uploading..." : "Change Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                </label>

                {profile.profileImageUrl && (
                  <button
                    onClick={deletePhoto}
                    className={SmallButtonBase + " border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"}
                  >
                    Delete Photo
                  </button>
                )}

                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className={SmallButtonBase + " bg-indigo-600 text-white hover:bg-indigo-700"}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={save}
                      className={SmallButtonBase + " bg-emerald-600 text-white hover:bg-emerald-700"}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setForm(profile);
                      }}
                      className={SmallButtonBase + " bg-slate-100 text-slate-800 hover:bg-slate-200"}
                    >
                      Cancel
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowPasswordModal(true)}
                  className={SmallButtonBase + " bg-purple-600 text-white hover:bg-purple-700"}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {!editing ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Details</div>
                <div className="text-xs text-slate-500">Personal metrics & preferences</div>
              </div>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                BMI: {bmi ?? "—"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Age" value={profile.age} />
              <Field label="Gender" value={profile.gender} />
              <Field label="Weight (kg)" value={profile.weight} />
              <Field label="Height (cm)" value={profile.height} />
              <Field label="BMI" value={bmi} />
              <Field label="Goals" value={profile.goals} />
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <div className="text-sm font-semibold text-slate-900">Edit details</div>
              <div className="text-xs text-slate-500">Update your profile information</div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full Name" value={form.name} set={(v) => setForm({ ...form, name: v })} inputClass={InputBase} />
              <Input label="Age" value={form.age} set={(v) => setForm({ ...form, age: v })} inputClass={InputBase} />
              <Select
                label="Gender"
                value={form.gender}
                set={(v) => setForm({ ...form, gender: v })}
                options={["Male", "Female", "Other"]}
                inputClass={InputBase}
              />
              <Input label="Weight (kg)" value={form.weight} set={(v) => setForm({ ...form, weight: v })} inputClass={InputBase} />
              <Input label="Height (cm)" value={form.height} set={(v) => setForm({ ...form, height: v })} inputClass={InputBase} />
              <Input label="Goals" value={form.goals} set={(v) => setForm({ ...form, goals: v })} inputClass={InputBase} />
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Bio</span>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className={InputBase + " mt-1 min-h-[110px]"}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="relative p-6">
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-15" />
                <div className="relative">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Change Password</h2>
                  <p className="mt-1 text-sm text-slate-500">Keep your account secure.</p>
                </div>
              </div>

              <div className="px-6 pb-6">
                {passwordError && (
                  <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-600">Old Password</span>
                      <input
                        type={showOld ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className={InputBase + " mt-1 pr-11"}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-9 rounded-lg p-1 text-slate-600 hover:bg-slate-100"
                      aria-label="Toggle old password visibility"
                    >
                      {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-600">New Password</span>
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={InputBase + " mt-1 pr-11"}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-9 rounded-lg p-1 text-slate-600 hover:bg-slate-100"
                      aria-label="Toggle new password visibility"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    {newPassword && (
                      <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-700">
                        Strength: <span className="font-semibold">{evaluateStrength(newPassword)}</span>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-600">Confirm New Password</span>
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={InputBase + " mt-1 pr-11"}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-9 rounded-lg p-1 text-slate-600 hover:bg-slate-100"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className={ButtonBase + " bg-slate-100 text-slate-800 hover:bg-slate-200"}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={changePassword}
                    className={ButtonBase + " bg-purple-600 text-white hover:bg-purple-700"}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-slate-900">{value || "—"}</div>
    </div>
  );
}

function Input({
  label,
  value,
  set,
  inputClass,
}: {
  label: string;
  value: any;
  set: (v: any) => void;
  inputClass: string;
}) {
  return (
    <div>
      <label className="block">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <input
          type={label.toLowerCase().includes("password") ? "password" : "text"}
          className={inputClass + " mt-1"}
          value={value || ""}
          onChange={(e) => set(e.target.value)}
        />
      </label>
    </div>
  );
}

function Select({
  label,
  value,
  set,
  options,
  inputClass,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  options: string[];
  inputClass: string;
}) {
  return (
    <div>
      <label className="block">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <select
          className={inputClass + " mt-1"}
          value={value || ""}
          onChange={(e) => set(e.target.value)}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

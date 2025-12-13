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

  if (loading) return <div className="p-6">Loading profile…</div>;
  if (error && !profile) return <div className="p-6 text-red-600">{error}</div>;
  if (!profile) return null;

  if (isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden">
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-semibold">
                  {profile.email[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{profile.email}</div>
                  <div className="text-sm text-gray-500">Admin Account</div>
                </div>
                <button
                  onClick={() => {
                    if (isAdmin) navigate("/admin");
                    else navigate("/dashboard");
                  }}
                  className="px-3 py-2 bg-gray-200 rounded"
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          <div className="text-gray-500 text-sm">
            This is an admin account. Personal profile fields are hidden.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-semibold">
                {(profile.name || profile.email)[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="text-3xl font-bold">{profile.name || profile.email}</div>
            <div className="text-gray-600">{profile.email}</div>
            <div className="mt-2 text-gray-700 italic">{profile.bio || "No bio added"}</div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <label className="px-3 py-2 bg-gray-100 rounded cursor-pointer">
                {uploading ? "Uploading..." : "Change Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </label>

              {profile.profileImageUrl && (
                <button
                  onClick={deletePhoto}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  Delete Photo
                </button>
              )}

              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={save}
                    className="px-3 py-2 bg-green-600 text-white rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setForm(profile);
                    }}
                    className="px-3 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                </>
              )}

              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-3 py-2 bg-purple-600 text-white rounded"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {!editing ? (
        <div className="bg-white shadow rounded-xl p-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <Field label="Age" value={profile.age} />
            <Field label="Gender" value={profile.gender} />
            <Field label="Weight (kg)" value={profile.weight} />
            <Field label="Height (cm)" value={profile.height} />
            <Field label="BMI" value={bmi} />
            <Field label="Goals" value={profile.goals} />
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl p-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <Input label="Full Name" value={form.name} set={(v) => setForm({ ...form, name: v })} />
            <Input label="Age" value={form.age} set={(v) => setForm({ ...form, age: v })} />
            <Select
              label="Gender"
              value={form.gender}
              set={(v) => setForm({ ...form, gender: v })}
              options={["Male", "Female", "Other"]}
            />
            <Input label="Weight (kg)" value={form.weight} set={(v) => setForm({ ...form, weight: v })} />
            <Input label="Height (cm)" value={form.height} set={(v) => setForm({ ...form, height: v })} />
            <Input label="Goals" value={form.goals} set={(v) => setForm({ ...form, goals: v })} />
            <div className="col-span-2">
              <label className="block text-sm">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            {passwordError && <div className="text-red-600 mb-2">{passwordError}</div>}

            <div className="relative mb-2">
              <label className="block text-sm">Old Password</label>
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-2 top-8 text-gray-600"
              >
                {showOld ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <div className="relative mb-2">
              <label className="block text-sm">New Password</label>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2 top-8 text-gray-600"
              >
                {showNew ? <EyeOff /> : <Eye />}
              </button>
              {newPassword && (
                <div className="text-sm text-center mt-1">
                  Strength: {evaluateStrength(newPassword)}
                </div>
              )}
            </div>

            <div className="relative mb-2">
              <label className="block text-sm">Confirm New Password</label>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2 top-8 text-gray-600"
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-3 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={changePassword}
                className="px-3 py-2 bg-purple-600 text-white rounded"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-lg font-medium">{value || "—"}</div>
    </div>
  );
}

function Input({ label, value, set }: { label: string; value: any; set: (v: any) => void }) {
  return (
    <div className="mb-2">
      <label className="block text-sm">{label}</label>
      <input
        type={label.toLowerCase().includes("password") ? "password" : "text"}
        className="w-full p-2 border rounded mt-1"
        value={value || ""}
        onChange={(e) => set(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, set, options }: { label: string; value: string; set: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-sm">{label}</label>
      <select
        className="w-full p-2 border rounded mt-1"
        value={value || ""}
        onChange={(e) => set(e.target.value)}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}


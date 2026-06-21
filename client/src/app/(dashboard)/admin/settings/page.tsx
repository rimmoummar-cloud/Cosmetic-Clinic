"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../../../../lib/api";

interface FormData {
  name: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
  backend?: string;
}

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/me");
      const { name, email } = response.data.admin;
      setFormData((prev) => ({
        ...prev,
        name: name || "",
        email: email || "",
      }));
      setErrors({});
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load profile";
      toast.error(errorMsg);
      setErrors({ backend: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password: string): boolean => {
    if (password.length < 8 || password.length > 128) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    return true;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "Full Name is required";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Full Name must be at least 2 characters";
    } else if (trimmedName.length > 100) {
      newErrors.name = "Full Name must not exceed 100 characters";
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.newPassword) {
      if (!isValidPassword(formData.newPassword)) {
        newErrors.newPassword =
          "Password must be 8-128 characters with uppercase, lowercase, number, and special character";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your new password";
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password only applies when changing password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Open re-auth modal instead of submitting directly
    setShowReauthModal(true);
    setReauthPassword("");
    setReauthError("");
  };

  const handleReauthConfirm = async () => {
    if (!reauthPassword.trim()) {
      setReauthError("Password is required");
      return;
    }

    setIsVerifying(true);
    setReauthError("");

    try {
      // Verify password
      await api.post("/verify-password", {
        password: reauthPassword,
      });

      // Password verified, proceed with profile update
      await updateProfile();

      // Close modal after success
      setShowReauthModal(false);
      setReauthPassword("");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Password verification failed";
      setReauthError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const updateProfile = async () => {
    try {
      setIsSaving(true);
      setSuccessMessage("");
      setErrors({});

      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
      }

      await api.put("/profile", payload);

      const passwordChanged = !!formData.newPassword;

      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));

      if (passwordChanged) {
        setSuccessMessage("Password updated successfully. Please log in again.");
        toast.success("Password updated successfully");
        // setTimeout(() => {
        //   window.location.href = "/logout";
        // }, 2000);

        setTimeout(async () => {
  try {
    await api.post("/logout");
    window.location.href = "/login";
  } catch (err) {
    toast.error("Logout failed");
  }
}, 2000);

      } else {
        setSuccessMessage("Profile updated successfully");
        toast.success("Profile updated successfully");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to update profile";
      setErrors({ backend: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReauthCancel = () => {
    setShowReauthModal(false);
    setReauthPassword("");
    setReauthError("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8">
        <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">Settings</h1>
        <p className="text-gray-500 text-sm mb-6">Manage your account information and password</p>

        {errors.backend && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{errors.backend}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-xl focus:outline-none transition-colors ${
                errors.name
                  ? "border-red-200 focus:border-red-300"
                  : "border-gray-200 focus:border-primary"
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-xl focus:outline-none transition-colors ${
                errors.email
                  ? "border-red-200 focus:border-red-300"
                  : "border-gray-200 focus:border-primary"
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password (Optional)
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full p-3 border rounded-xl focus:outline-none transition-colors ${
                errors.newPassword
                  ? "border-red-200 focus:border-red-300"
                  : "border-gray-200 focus:border-primary"
              }`}
              placeholder="Leave blank to keep current password"
            />
            {errors.newPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>
            )}
            {formData.newPassword && !errors.newPassword && (
              <p className="text-xs text-gray-500 mt-1">
                Must contain uppercase, lowercase, number, and special character (8-128 chars)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3 border rounded-xl focus:outline-none transition-colors ${
                errors.confirmPassword
                  ? "border-red-200 focus:border-red-300"
                  : "border-gray-200 focus:border-primary"
              }`}
              placeholder="Confirm your new password"
              disabled={!formData.newPassword}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Re-auth Modal */}
      {showReauthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold font-[var(--font-heading)] mb-2">Confirm your identity</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your password to continue</p>

            {reauthError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{reauthError}</p>
              </div>
            )}

            {/* <input
              type="password"
              value={reauthPassword}
              onChange={(e) => setReauthPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors mb-6"
              placeholder="Enter your password"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isVerifying) {
                  handleReauthConfirm();
                }
              }}
            /> */}
<input
  type="password"
  value={reauthPassword}
  onChange={(e) => setReauthPassword(e.target.value)}
  autoComplete="new-password"
  name="new-password"
  placeholder="Enter your password"
  className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors mb-6"
/>
            <div className="flex gap-3">
              <button
                onClick={handleReauthCancel}
                disabled={isVerifying}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleReauthConfirm}
                disabled={isVerifying}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

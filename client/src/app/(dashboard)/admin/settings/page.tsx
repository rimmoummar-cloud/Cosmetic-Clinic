"use client";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your clinic and profile settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-6">Profile Settings</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
              A
            </div>
            <div>
              <button className="text-sm text-primary font-medium hover:underline">Change Photo</button>
            </div>
          </div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="Admin User"
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue="admin@shinyskin.com"
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                defaultValue="+1 (234) 567-890"
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <button
              type="button"
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Clinic Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-6">Clinic Settings</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
              <input
                type="text"
                defaultValue="Shiny Skin"
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                defaultValue="123 Beauty Boulevard, Suite 100, Beverly Hills, CA 90210"
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                <input
                  type="time"
                  defaultValue="09:00"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                <input
                  type="time"
                  defaultValue="19:00"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
              <textarea
                rows={4}
                defaultValue="Premium cosmetic clinic offering advanced skincare treatments."
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>
            <button
              type="button"
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-6">Change Password</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors" />
            </div>
            <button
              type="button"
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <h2 className="text-lg font-bold font-[var(--font-heading)] text-red-600 mb-4">Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            These actions are irreversible. Please proceed with caution.
          </p>
          <div className="space-y-3">
            <button className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
              Reset All Data
            </button>
            <button className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

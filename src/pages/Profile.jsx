import { Mail, ShieldCheck, User } from "lucide-react";

const Profile = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Page Title */}
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 flex gap-6">

        {/* Avatar */}
        <div className="flex flex-col items-center w-40">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <User className="w-10 h-10 text-green-600" />
          </div>

          <p className="mt-3 font-medium">Owner Admin</p>
          <span className="text-sm text-green-600">Owner</span>
        </div>

        {/* Info */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Name */}
          <div>
            <label className="text-sm text-gray-500">Full Name</label>
            <p className="font-medium mt-1">Owner Admin</p>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-500 flex items-center gap-1">
              <Mail size={14} /> Email
            </label>
            <p className="font-medium mt-1">owner@rover.com</p>
          </div>

          {/* Role */}
          <div>
            <label className="text-sm text-gray-500 flex items-center gap-1">
              <ShieldCheck size={14} /> Role
            </label>
            <p className="font-medium mt-1">System Owner</p>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm text-gray-500">Account Status</label>
            <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
              Active
            </span>
          </div>

        </div>
      </div>

      {/* Info Note */}
      <p className="text-sm text-gray-500 mt-4">
        To update your password or security settings, go to
        <span className="text-green-600 font-medium"> Settings</span>.
      </p>

    </div>
  );
};

export default Profile;

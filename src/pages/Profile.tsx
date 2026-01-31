import { Mail, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profilePics, profilePicUrls } from "@/assets/profilepic";

const Profile = () => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const storedAvatar = localStorage.getItem("selectedAvatar");
    if (storedAvatar) setAvatar(storedAvatar);
  }, []);

  const handleAvatarClick = (pic: string) => {
    setAvatar(pic);
    localStorage.setItem("selectedAvatar", pic);
    setShowGallery(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      <h1 className="text-2xl font-semibold mb-6 dark:text-white">My Profile</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6 flex gap-6 relative">
        <div className="flex flex-col items-center w-40 relative">
          <div
            className="w-24 h-24 rounded-full bg-[#2ec8cf]/20 flex items-center justify-center cursor-pointer relative"
            onClick={() => setShowGallery(!showGallery)}
          >
            {avatar && profilePicUrls[avatar] ? (
              <img src={profilePicUrls[avatar]} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-sm text-[#2ec8cf] font-medium">Change Avatar</span>
            )}
          </div>
          <p className="mt-3 font-medium dark:text-white">Owner Admin</p>
          <span className="text-sm text-[#2ec8cf]">Owner</span>
          {showGallery && (
            <div className="absolute top-32 left-0 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg p-3 z-50 flex flex-wrap gap-2 max-w-xs">
              {profilePics.map((pic) => (
                <img
                  key={pic}
                  src={profilePicUrls[pic]}
                  alt="avatar option"
                  className="w-12 h-12 rounded-full cursor-pointer border-2 hover:border-[#2ec8cf]"
                  onClick={() => handleAvatarClick(pic)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Full Name</label>
            <p className="font-medium mt-1 dark:text-white">Owner Admin</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Mail size={14} /> Email
            </label>
            <p className="font-medium mt-1 dark:text-white">owner@rover.com</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <ShieldCheck size={14} /> Role
            </label>
            <p className="font-medium mt-1 dark:text-white">System Owner</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Account Status</label>
            <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-[#2ec8cf]/20 text-[#2ec8cf]">Active</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        To update your password or security settings, go to{" "}
        <span className="text-[#2ec8cf] font-medium cursor-pointer" onClick={() => navigate("/settings")}>
          Settings
        </span>
        .
      </p>

      <div className="mt-6">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="px-6 py-2 bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white rounded-lg shadow transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;

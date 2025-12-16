import { Mail, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

const Profile = () => {
  // Avatar state
  const [avatar, setAvatar] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  const profilePics = [
    "pic1.png",
    "pic2.png",
    "pic3.png",
    "pic4.png",
    "pic5.png",
    "pic6.png",
    "pic7.png",
    "pic8.png",
    "pic9.png",
    "pic10.png",
    "pic11.png",
  ];


  useEffect(() => {
    const storedAvatar = localStorage.getItem("selectedAvatar");
    if (storedAvatar) setAvatar(storedAvatar);
  }, []);

 
  const handleAvatarClick = (pic) => {
    setAvatar(pic);
    localStorage.setItem("selectedAvatar", pic);
    setShowGallery(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 flex gap-6 relative">
        {/* Avatar Section */}
        <div className="flex flex-col items-center w-40 relative">
          <div
            className="w-24 h-24 rounded-full bg-[#2ec8cf]/20 flex items-center justify-center cursor-pointer relative"
            onClick={() => setShowGallery(!showGallery)}
          >
            {avatar ? (
              <img
                src={`/profilepic/${avatar}`}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-sm text-[#2ec8cf] font-medium">
                Change Avatar
              </span>
            )}
          </div>

          <p className="mt-3 font-medium">Owner Admin</p>
          <span className="text-sm text-[#2ec8cf]">Owner</span>

          {/* Avatar Gallery Popup */}
          {showGallery && (
            <div className="absolute top-32 left-0 bg-white border rounded-lg shadow-lg p-3 z-50 flex flex-wrap gap-2 max-w-xs">
              {profilePics.map((pic) => (
                <img
                  key={pic}
                  src={`/profilepic/${pic}`}
                  alt="avatar option"
                  className="w-12 h-12 rounded-full cursor-pointer border-2 hover:border-[#2ec8cf]"
                  onClick={() => handleAvatarClick(pic)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">Full Name</label>
            <p className="font-medium mt-1">Owner Admin</p>
          </div>

          <div>
            <label className="text-sm text-gray-500 flex items-center gap-1">
              <Mail size={14} /> Email
            </label>
            <p className="font-medium mt-1">owner@rover.com</p>
          </div>

          <div>
            <label className="text-sm text-gray-500 flex items-center gap-1">
              <ShieldCheck size={14} /> Role
            </label>
            <p className="font-medium mt-1">System Owner</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Account Status</label>
            <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-[#2ec8cf]/20 text-[#2ec8cf]">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <p className="text-sm text-gray-500 mt-4">
        To update your password or security settings, go to
        <span className="text-[#2ec8cf] font-medium"> Settings</span>.
      </p>
    </div>
  );
};

export default Profile;

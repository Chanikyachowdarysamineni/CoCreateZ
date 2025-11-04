import React from "react";

const PresenceAvatars: React.FC = () => {
  // TODO: Connect to socket.io for real-time presence
  return (
    <div className="flex gap-2 items-center">
      <span className="font-bold">Currently Editing:</span>
      {/* Example avatars, replace with live data */}
      <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center">S</div>
      <div className="w-8 h-8 rounded-full bg-green-400 text-white flex items-center justify-center">M</div>
      <div className="w-8 h-8 rounded-full bg-purple-400 text-white flex items-center justify-center">E</div>
    </div>
  );
};

export default PresenceAvatars;

import React from "react";

const CollabComments: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg bg-white/80 shadow">
      <h3 className="font-bold mb-2">Comments & Annotations</h3>
      <div className="mb-2">Inline comments, threaded discussions, and tag mentions (@username).</div>
      {/* TODO: Add comment thread UI and mention logic */}
    </div>
  );
};

export default CollabComments;

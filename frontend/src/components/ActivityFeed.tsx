import React from "react";

const ActivityFeed: React.FC = () => {
  // TODO: Connect to backend for real-time activity
  return (
    <div className="p-4 border rounded-lg bg-white/80 shadow">
      <h3 className="font-bold mb-2">Activity Feed</h3>
      <ul className="list-disc pl-4 space-y-1 text-sm">
        <li><span className="font-semibold">Sarah</span> edited <span className="font-semibold">Marketing Campaign Analysis.xlsx</span></li>
        <li><span className="font-semibold">Mike</span> uploaded <span className="font-semibold">Q4 Budget Planning.xlsx</span></li>
        <li><span className="font-semibold">Emma</span> commented on <span className="font-semibold">Team Meeting Minutes.docx</span></li>
      </ul>
      {/* TODO: Add real-time updates */}
    </div>
  );
};

export default ActivityFeed;

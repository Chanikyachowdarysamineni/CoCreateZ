import React from "react";

const VersionControl: React.FC = () => {
  // TODO: Connect to backend for version history and rollback
  return (
    <div className="p-4 border rounded-lg bg-white/80 shadow">
      <h3 className="font-bold mb-2">Version Control & Rollback</h3>
      <div>Save document versions and restore earlier states.</div>
      {/* TODO: Add version list and restore UI */}
    </div>
  );
};

export default VersionControl;

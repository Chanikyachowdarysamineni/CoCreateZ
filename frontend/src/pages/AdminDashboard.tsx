
import React from "react";
import { useNavigate } from "react-router-dom";


const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin & Management</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li>Role Management Dashboard: Create roles with custom permissions</li>
        <li>Organization/Team Spaces: Shared workspace for groups</li>
        <li>Automated Backups: Scheduled data export & restore</li>
        <li>API Access: For third-party developers to build plugins</li>
      </ul>
      <div className="mt-8 space-y-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => navigate("/role-management")}>Manage Roles</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => navigate("/team-spaces")}>Team Spaces</button>
        <button className="bg-yellow-600 text-white px-4 py-2 rounded" onClick={() => navigate("/backups")}>Backups</button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={() => navigate("/api-access")}>API Access</button>
      </div>
    </div>
  );
};

export default AdminDashboard;

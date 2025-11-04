import React from "react";

const Integrations: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Integrations</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li>Cloud Storage Sync: Google Drive, OneDrive, Dropbox import/export</li>
        <li>Calendar Integration: Link tasks/events with Google Calendar or Outlook</li>
        <li>Slack/Discord/Webhooks: Notifications on file edits or comments</li>
        <li>GitHub/GitLab Integration: Manage code files collaboratively</li>
      </ul>
      <div className="mt-8 space-y-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Connect Cloud Storage</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded">Connect Calendar</button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded">Configure Webhooks</button>
        <button className="bg-gray-800 text-white px-4 py-2 rounded">Connect GitHub/GitLab</button>
      </div>
    </div>
  );
};

export default Integrations;

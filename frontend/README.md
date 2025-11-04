

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.


## Features


- Microsoft-like collaborative editors: Word, Excel, PowerPoint (rich editing, real-time collaboration)
- Interactive dashboard with quick actions, drag-and-drop, animated stats, and advanced search
- Real-time file management: upload, share, download, delete, and preview files
- Persistent storage and instant updates via socket.io
- User authentication and role-based access
- Modern UI/UX: Navbar, modals, dark mode, shadcn UI components, Tailwind CSS styling
- File type restrictions and context-aware upload options

### Admin & Management
- Role Management Dashboard: Create roles with custom permissions
- Organization/Team Spaces: Shared workspace for groups
- Automated Backups: Scheduled data export & restore
- API Access: For third-party developers to build plugins

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- socket.io-client
- framer-motion

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5e50f668-e7d6-4e31-b7af-20090c522ee1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

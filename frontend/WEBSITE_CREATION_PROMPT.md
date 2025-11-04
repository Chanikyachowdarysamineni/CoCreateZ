# Complete Website Creation Prompt

## Project Overview
Create a modern, professional collaboration platform website with the following specifications:

## Technical Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui component library
- **Routing**: React Router DOM v6
- **State Management**: TanStack Query for server state
- **Icons**: Lucide React
- **Animations**: Tailwind CSS animations with custom keyframes
- **Toast Notifications**: Sonner + Radix UI Toast

## Design System Requirements

### Color Palette (HSL format in CSS variables)
```css
:root {
  /* Base colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* UI colors */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  
  /* Primary brand colors */
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  
  /* Secondary colors */
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  
  /* Accent colors */
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  
  /* Destructive colors */
  --destructive: 0 72.22% 50.59%;
  --destructive-foreground: 210 40% 98%;
  
  /* Border and input */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  
  /* Chart colors */
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  
  /* Custom gradients */
  --gradient-primary: linear-gradient(135deg, hsl(221.2 83.2% 53.3%), hsl(262.1 83.3% 57.8%));
  --gradient-secondary: linear-gradient(135deg, hsl(210 40% 96%), hsl(214.3 31.8% 91.4%));
  --gradient-hero: linear-gradient(135deg, hsl(221.2 83.2% 53.3% / 0.1), hsl(262.1 83.3% 57.8% / 0.1));
  
  /* Custom shadows */
  --shadow-elegant: 0 10px 30px -10px hsl(221.2 83.2% 53.3% / 0.3);
  --shadow-card: 0 4px 6px -1px hsl(221.2 83.2% 53.3% / 0.1);
  
  /* Transitions */
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 94.1%;
}
```

### Typography
- **Font Family**: Inter (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- **Headings**: Font weights 600-800, appropriate line heights
- **Body Text**: Font weight 400-500, 1.6 line height
- **Small Text**: Font weight 400, 1.4 line height

### Animations
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px hsl(var(--primary) / 0.4);
  }
  50% {
    box-shadow: 0 0 40px hsl(var(--primary) / 0.6);
  }
}
```

## Page Structure & Functionality

### 1. Landing Page (Index.tsx)
**Layout**: Navbar + Hero + Features + Footer

**Navbar Requirements**:
- Logo with "CollabSpace" text
- Desktop navigation: Home, Features, Pricing, About, Contact
- Auth buttons: Login, Sign Up
- Mobile hamburger menu
- Sticky positioning with backdrop blur
- Active link highlighting based on current route

**Hero Section Requirements**:
- Large headline: "Collaborate Without Limits"
- Subheadline: "The modern workspace for distributed teams"
- Description paragraph about platform benefits
- Two CTA buttons: "Start Collaborating Free" (primary), "Watch Demo" (secondary)
- Trust indicators: "500K+ Users", "Real-time Sync", "Enterprise Security", "Global Access"
- Hero image with floating collaboration cards
- Background gradient with subtle animation
- User avatars with star ratings for social proof

**Features Section Requirements**:
- Section title: "Everything you need to collaborate"
- 3 main features in grid layout:
  1. **AI-Powered Insights** (feature-ai.jpg)
     - Icon: Brain
     - Description: Advanced analytics and intelligent recommendations
  2. **Real-time Collaboration** (feature-realtime.jpg)
     - Icon: Users
     - Description: Work together seamlessly in real-time
  3. **Advanced Dashboard** (feature-dashboard.jpg)
     - Icon: BarChart3
     - Description: Comprehensive analytics and reporting tools

- 6 additional features in 2-3 column grid:
  1. Cloud Storage (Cloud icon)
  2. Team Analytics (TrendingUp icon)
  3. Smart Notifications (Bell icon)
  4. Version Control (GitBranch icon)
  5. Mobile Access (Smartphone icon)
  6. 24/7 Support (Headphones icon)

**Footer Requirements**:
- Logo and company description
- 4 link columns: Product, Company, Resources, Legal
- Social media icons: GitHub, Twitter, LinkedIn
- Copyright notice
- Status and Changelog links

### 2. Authentication Pages

**Login Page (Login.tsx)**:
- Split-screen layout (50/50)
- Left side: Brand showcase with features and animations
- Right side: Login form with:
  - Email input (with validation)
  - Password input (with show/hide toggle)
  - "Remember me" checkbox
  - "Forgot password?" link
  - Login button with loading state
  - "Don't have an account?" signup link
  - Social login options (Google, GitHub)
- Background animations and gradients
- Trust indicators and testimonials on brand side

**Signup Page (Signup.tsx)**:
- Similar split-screen layout to login
- Right side form with:
  - Full name input
  - Email input (with validation)
  - Password input (with strength indicator)
  - Confirm password input
  - Terms acceptance checkbox
  - Signup button with loading state
  - "Already have an account?" login link
  - Social signup options
- Left side: Different brand messaging focused on getting started

### 3. Dashboard Page (Dashboard.tsx)
**Layout**: Sidebar + Main Content Area

**Sidebar Requirements**:
- Company logo
- Navigation menu with icons:
  - Dashboard (LayoutDashboard)
  - Files (FileText)
  - Uploads (Upload)
  - Team (Users)
  - Settings (Settings)
  - Profile (User)
- Logout button at bottom
- User avatar and name display
- Collapsible on mobile

**Main Dashboard Content**:
- Welcome message with user's name
- Key metrics in card layout:
  - Total Files (with trending indicator)
  - Active Projects (with progress bars)
  - Team Members (with avatars)
  - Storage Used (with percentage bar)
- Recent Activity section with timeline
- Quick Actions card with common tasks
- Charts section:
  - File upload trends (line chart)
  - Project status distribution (pie chart)
  - Team activity heatmap
- Animated counters and progress indicators

### 4. Files Page (Files.tsx)
- File browser interface with:
  - Breadcrumb navigation
  - Search and filter options
  - View toggle (grid/list)
  - Sort options (name, date, size, type)
- File cards/rows showing:
  - File type icon
  - File name and size
  - Last modified date
  - Actions menu (download, share, delete)
- Drag and drop upload area
- Bulk selection and actions
- Folder creation and navigation

### 5. Uploads Page (Uploads.tsx)
- Drag and drop upload zone
- File upload progress indicators
- Upload queue with pause/resume/cancel
- File type restrictions and size limits
- Bulk upload capabilities
- Upload history with status
- Integration with cloud storage providers

### 6. User Profile Page (UserProfile.tsx)
- Profile picture upload/change
- Personal information form:
  - Full name
  - Email (with verification status)
  - Phone number
  - Bio/description
  - Location
- Account settings:
  - Password change
  - Two-factor authentication
  - Email preferences
  - Privacy settings
- Activity log/history
- Account deletion option

### 7. 404 Not Found Page (NotFound.tsx)
- Creative 404 illustration
- "Oops! Page not found" message
- Search functionality
- Suggested pages/links
- "Go Home" button
- Fun animation or interactive element

## Component Architecture

### Reusable Components
1. **Button Component** (button.tsx)
   - Variants: default, destructive, outline, secondary, ghost, link
   - Sizes: default, sm, lg, icon
   - Loading state with spinner
   - Disabled state styling

2. **Card Component** (card.tsx)
   - Header, content, footer sections
   - Hover effects and animations
   - Shadow variants

3. **Input Components** (input.tsx, textarea.tsx)
   - Validation states (error, success)
   - Placeholder animations
   - Focus effects

4. **Navigation Components**
   - Breadcrumbs with proper ARIA
   - Pagination with first/last/prev/next
   - Tabs with keyboard navigation

5. **Data Display Components**
   - Tables with sorting and filtering
   - Charts using Recharts
   - Progress bars and indicators
   - Avatars with fallbacks

6. **Feedback Components**
   - Toast notifications
   - Loading skeletons
   - Error boundaries
   - Confirmation dialogs

## Responsive Design Requirements
- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px
- Touch-friendly interactions on mobile
- Collapsible navigation
- Responsive typography scaling
- Optimized images with proper aspect ratios

## Performance Requirements
- Lazy loading for images and components
- Code splitting by route
- Optimized bundle size
- Fast loading times (<3s)
- Smooth animations (60fps)
- SEO optimization with proper meta tags

## Accessibility Requirements
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG AA)
- Focus indicators
- Alternative text for images

## File Structure
```
src/
├── components/
│   ├── ui/           # Shadcn components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Footer.tsx
│   └── FileUpload.tsx
├── pages/
│   ├── Index.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── Files.tsx
│   ├── Uploads.tsx
│   ├── UserProfile.tsx
│   └── NotFound.tsx
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   └── utils.ts
├── assets/
│   ├── hero-collaboration.jpg
│   ├── feature-ai.jpg
│   ├── feature-dashboard.jpg
│   └── feature-realtime.jpg
├── App.tsx
├── main.tsx
└── index.css
```

## Implementation Priority
1. Set up design system (index.css + tailwind.config.ts)
2. Create basic routing structure (App.tsx)
3. Build reusable UI components
4. Implement landing page (Index.tsx)
5. Create authentication pages
6. Build dashboard with sidebar navigation
7. Implement remaining pages
8. Add animations and micro-interactions
9. Optimize for performance and accessibility
10. Test across devices and browsers

## Key Features
- Dark/light mode toggle
- Responsive design for all screen sizes
- Smooth page transitions
- Interactive hover effects
- Form validation with proper error handling
- File upload with progress tracking
- Real-time updates simulation
- Beautiful loading states
- Comprehensive error handling
- SEO-friendly structure

This prompt provides a complete specification for building a modern, professional collaboration platform website with all necessary components, styling, and functionality.
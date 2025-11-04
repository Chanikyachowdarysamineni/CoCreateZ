import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileEdit, 
  Upload, 
  Users, 
  MessageCircle, 
  Brain, 
  Target, 
  Layers, 
  Zap,
  Clock,
  BarChart3
} from "lucide-react";
import realtimeImage from "@/assets/feature-realtime.jpg";
import dashboardImage from "@/assets/feature-dashboard.jpg";
import aiImage from "@/assets/feature-ai.jpg";

const Features = () => {
  const mainFeatures = [
    {
      icon: FileEdit,
      title: "Real-time Document Editing",
      description: "Collaborate on Excel, PowerPoint, and Word documents simultaneously with live cursors and instant sync.",
      image: realtimeImage,
      highlight: true
    },
    {
      icon: Brain,
      title: "AI-Powered Assistant",
      description: "Get smart suggestions, content generation, and insights while you work with our integrated AI chat.",
      image: aiImage,
      highlight: true
    },
    {
      icon: Users,
      title: "Smart Team Management",
      description: "Form teams, manage permissions, and control access with granular sharing controls.",
      image: dashboardImage,
      highlight: true
    }
  ];

  const additionalFeatures = [
    {
      icon: Upload,
      title: "Seamless File Uploads",
      description: "Upload and share Excel, PowerPoint, and Word files with instant team visibility."
    },
    {
      icon: Target,
      title: "Smart Meeting Digest",
      description: "AI-powered meeting summaries with automatic action items and key decisions."
    },
    {
      icon: Layers,
      title: "One-Click Feedback",
      description: "Overlay comments and drawings on any content without file uploads."
    },
    {
      icon: Zap,
      title: "Focus Mode",
      description: "Deep work sessions with team visibility and progress tracking."
    },
    {
      icon: Clock,
      title: "Live Pulse Check",
      description: "Real-time sentiment tracking during meetings with engagement analytics."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track team productivity, collaboration patterns, and project insights."
    }
  ];

  return (
    <section className="py-24 bg-gradient-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold">
            Everything Your Team
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Needs to Collaborate
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From real-time editing to AI-powered insights, CollabSync brings all your 
            collaboration tools together in one seamless workspace.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group relative overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in-up border-0 bg-gradient-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              
              <CardHeader className="space-y-4">
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-primary/20" />
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {additionalFeatures.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-in-up border-0 bg-gradient-card"
              style={{ animationDelay: `${(index + 3) * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
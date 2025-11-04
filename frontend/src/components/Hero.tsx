import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  Users, 
  Zap, 
  Star, 
  CheckCircle, 
  TrendingUp,
  Globe,
  Shield
} from "lucide-react";
import heroImage from "@/assets/hero-collaboration.jpg";

const Hero = () => {
  const features = [
    { icon: Users, text: "500K+ Users" },
    { icon: Zap, text: "Real-time Sync" },
    { icon: Shield, text: "Enterprise Security" },
    { icon: Globe, text: "Global Access" }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
        {/* Enhanced Content */}
        <div className="space-y-8 animate-fade-in-up">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full text-sm font-semibold text-blue-600 border border-blue-200">
              <Sparkles className="w-4 h-4" />
              #1 Real-time Collaboration Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Sync Your Team's
              </span>
              <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Creative Flow
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Eliminate workflow friction with real-time document editing, AI-powered insights, 
              and seamless team collaboration in one beautiful workspace.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 py-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <div className="p-1 bg-green-100 rounded-full">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  {feature.text}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 group" 
              asChild
            >
              <Link to="/signup">
                Start Collaborating Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 px-8 border-2 hover:border-blue-300 hover:bg-blue-50 transition-all group" 
              asChild
            >
              <Link to="/demo">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Enhanced Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-muted-foreground">
                Trusted by 500K+ teams worldwide
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm font-medium text-muted-foreground ml-1">4.9/5</span>
              </div>
            </div>
            
            <div className="flex -space-x-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm"
                  title={`User ${i + 1}`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-gray-100 border-3 border-white shadow-lg flex items-center justify-center text-xs font-bold text-gray-600">
                +99K
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Hero Image */}
        <div className="relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <img
              src={heroImage}
              alt="Team collaboration workspace showing real-time editing"
              className="relative rounded-3xl shadow-2xl w-full h-auto hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl" />
          </div>
          
          {/* Enhanced Floating Cards */}
          <div className="absolute -top-6 -left-6 bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 animate-float">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg" />
              <div>
                <div className="text-sm font-bold text-gray-900">12 users editing</div>
                <div className="text-xs text-gray-600">Live collaboration</div>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 animate-float" style={{ animationDelay: "1.5s" }}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <div className="text-sm font-bold text-gray-900">AI Assistant</div>
                <div className="text-xs text-gray-600">Smart suggestions</div>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 -left-4 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20 animate-float" style={{ animationDelay: "3s" }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm font-bold text-gray-900">+127%</div>
                <div className="text-xs text-gray-600">Productivity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
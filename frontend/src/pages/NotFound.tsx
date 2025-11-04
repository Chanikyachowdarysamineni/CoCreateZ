import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, Users } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* 404 Animation */}
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-white animate-bounce">404</h1>
          <div className="w-24 h-1 bg-white/30 mx-auto rounded-full animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Oops! The page you're looking for seems to have wandered off. 
            Let's get you back to collaborating!
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              asChild 
              className="bg-white text-primary hover:bg-white/90 font-semibold"
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Link to="/dashboard">
                <Search className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>

          <Button 
            asChild 
            variant="ghost" 
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => window.history.back()}
          >
            <span className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </span>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-white/60 text-sm">
          Lost? Try searching for files or check out your{" "}
          <Link to="/dashboard" className="text-white/80 hover:underline">
            dashboard
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;

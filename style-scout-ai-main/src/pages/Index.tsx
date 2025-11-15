import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import ChatAssistant from "@/components/ChatAssistant";
import heroImage from "@/assets/hero-fashion.jpg";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50" />
        </div>
        
        <div className="relative z-10 text-center px-6 space-y-8">
          <h1 className="text-6xl md:text-8xl font-bold text-primary-foreground tracking-tight">
            Elevate Your Style
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
            Discover premium fashion curated for the modern individual
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/men">
              <Button 
                size="lg" 
                className="group bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-6 text-lg"
              >
                Shop Men
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/women">
              <Button 
                size="lg" 
                variant="outline" 
                className="group border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg"
              >
                Shop Women
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ChatAssistant />
    </div>
  );
};

export default Index;

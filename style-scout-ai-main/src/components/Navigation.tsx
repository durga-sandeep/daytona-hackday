import { Link } from "react-router-dom";
import { ShoppingBag, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <ShoppingBag className="w-6 h-6" />
            <span>LUXE</span>
          </Link>
          
          <div className="flex items-center gap-8">
            <Link 
              to="/men" 
              className="text-foreground hover:text-accent transition-colors duration-300"
            >
              Men
            </Link>
            <Link 
              to="/women" 
              className="text-foreground hover:text-accent transition-colors duration-300"
            >
              Women
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

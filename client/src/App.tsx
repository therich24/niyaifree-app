import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NovelDetail from "./pages/NovelDetail";
import Reader from "./pages/Reader";
import Genre from "./pages/Genre";
import SearchPage from "./pages/SearchPage";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isReader = location.startsWith("/read/");
  const isAdmin = location.startsWith("/admin");

  return (
    <>
      {!isReader && !isAdmin && <Navbar />}
      {children}
      {!isReader && !isAdmin && <Footer />}
    </>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/novel/:slug" component={NovelDetail} />
        <Route path="/read/:novelId/:chapterNumber" component={Reader} />
        <Route path="/genre/:name" component={Genre} />
        <Route path="/search" component={SearchPage} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/bookmarks" component={Dashboard} />
        <Route path="/admin" component={Admin} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

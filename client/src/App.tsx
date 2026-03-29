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
import CeoDashboard from "./pages/CeoDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import MemberProfile from "./pages/MemberProfile";
import VipPage from "./pages/VipPage";
import CoinsPage from "./pages/CoinsPage";
import EbookLibrary from "./pages/EbookLibrary";
import Analytics from "./pages/Analytics";
import Sitemap from "./pages/Sitemap";

import { usePageTracker } from "./hooks/usePageTracker";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isReader = location.startsWith("/read/");
  const isAdmin = location.startsWith("/admin");
  const isCeo = location.startsWith("/ceo");
  const isAnalytics = location.startsWith("/analytics");

  // Track all pageviews
  usePageTracker();

  return (
    <>
      {!isReader && !isAdmin && !isCeo && !isAnalytics && <Navbar />}
      {children}
      {!isReader && !isAdmin && !isCeo && !isAnalytics && <Footer />}
    </>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Public */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/novel/:slug" component={NovelDetail} />
        <Route path="/read/:novelId/:chapterNumber" component={Reader} />
        <Route path="/genre/:name" component={Genre} />
        <Route path="/category/:slug" component={Genre} />
        <Route path="/search" component={SearchPage} />
        <Route path="/vip" component={VipPage} />
        <Route path="/coins" component={CoinsPage} />

        {/* Member */}
        <Route path="/member" component={MemberDashboard} />
        <Route path="/member/profile" component={MemberProfile} />
        <Route path="/member/ebooks" component={EbookLibrary} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/bookmarks" component={Dashboard} />

        {/* Admin */}
        <Route path="/admin" component={Admin} />
        <Route path="/admin/:rest*" component={Admin} />

        {/* CEO */}
        <Route path="/ceo" component={CeoDashboard} />
        <Route path="/ceo/:rest*" component={CeoDashboard} />

        {/* Analytics */}
        <Route path="/analytics" component={Analytics} />

        {/* Sitemap */}
        <Route path="/sitemap.xml" component={Sitemap} />

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

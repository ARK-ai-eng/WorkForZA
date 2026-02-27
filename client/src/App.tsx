import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import DashboardPage from "./pages/DashboardPage";
import JobSearchPage from "./pages/JobSearchPage";
import CompaniesPage from "./pages/CompaniesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PerformanceMatchingPage from "./pages/PerformanceMatchingPage";
import ListsPage from "./pages/ListsPage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import PipelinePage from "./pages/PipelinePage";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/jobs" component={JobSearchPage} />
      <Route path="/companies" component={CompaniesPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/matching" component={PerformanceMatchingPage} />
      <Route path="/pipeline" component={PipelinePage} />
      <Route path="/lists" component={ListsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

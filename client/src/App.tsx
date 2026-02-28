import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Practice from "@/pages/practice";
import Results from "@/pages/results";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/practice/:sessionId" component={Practice} />
      <Route path="/results/:sessionId" component={Results} />
    </Switch>
  );
}

function App() {
  return (
    <Router hook={useHashLocation}>
      <TooltipProvider>
        <Toaster />
        <AppRoutes />
      </TooltipProvider>
    </Router>
  );
}

export default App;

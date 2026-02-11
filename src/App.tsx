import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider, useFinance } from "@/context/FinanceContext";
import BottomNav from "@/components/BottomNav";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import BudgetPage from "./pages/BudgetPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import GoalsPage from "./pages/GoalsPage";
import SettingsPage from "./pages/SettingsPage";
import OnboardingPage from "./pages/OnboardingPage";
import TransactionDetailPage from "./pages/TransactionDetailPage";
import HealthScorePage from "./pages/HealthScorePage";
import BillRemindersPage from "./pages/BillRemindersPage";
import SplitExpensePage from "./pages/SplitExpensePage";
import SubscriptionTrackerPage from "./pages/SubscriptionTrackerPage";
import EMICalculatorPage from "./pages/EMICalculatorPage";
import CashFlowPage from "./pages/CashFlowPage";
import NetWorthPage from "./pages/NetWorthPage";
import SavingsChallengesPage from "./pages/SavingsChallengesPage";
import MonthlySummaryPage from "./pages/MonthlySummaryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { onboarded } = useFinance();

  if (!onboarded) {
    return <OnboardingPage />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background max-w-lg mx-auto relative safe-top">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/transaction/:id" element={<TransactionDetailPage />} />
          <Route path="/health-score" element={<HealthScorePage />} />
          <Route path="/bills" element={<BillRemindersPage />} />
          <Route path="/split" element={<SplitExpensePage />} />
          <Route path="/subscriptions" element={<SubscriptionTrackerPage />} />
          <Route path="/emi" element={<EMICalculatorPage />} />
          <Route path="/cash-flow" element={<CashFlowPage />} />
          <Route path="/net-worth" element={<NetWorthPage />} />
          <Route path="/challenges" element={<SavingsChallengesPage />} />
          <Route path="/summary" element={<MonthlySummaryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FinanceProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </FinanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

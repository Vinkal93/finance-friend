import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { FinanceProvider, useFinance } from "@/context/FinanceContext";
import BottomNav from "@/components/BottomNav";
import AppLock from "@/components/AppLock";
import QuickAddFAB from "@/components/QuickAddFAB";
import ScrollToTop from "@/components/ScrollToTop";
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
import TransactionTemplatesPage from "./pages/TransactionTemplatesPage";
import SmartTagsPage from "./pages/SmartTagsPage";
import ReportBuilderPage from "./pages/ReportBuilderPage";
import DashboardCustomizePage from "./pages/DashboardCustomizePage";
import AIAssistantPage from "./pages/AIAssistantPage";
import PredictiveAnalyticsPage from "./pages/PredictiveAnalyticsPage";
import QuickAddSettingsPage from "./pages/QuickAddSettingsPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import PersonalizationPage from "./pages/PersonalizationPage";
import QuickBundlesPage from "./pages/QuickBundlesPage";
import ForecastCalendarPage from "./pages/ForecastCalendarPage";
import { initializeAds, onAppOpen } from "./lib/ads";
import { startAutoSync } from "./lib/syncQueue";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { onboarded } = useFinance();

  if (!onboarded) {
    return <OnboardingPage />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <BackButtonHandler />
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
          <Route path="/templates" element={<TransactionTemplatesPage />} />
          <Route path="/smart-tags" element={<SmartTagsPage />} />
          <Route path="/reports" element={<ReportBuilderPage />} />
          <Route path="/customize-dashboard" element={<DashboardCustomizePage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/forecast" element={<PredictiveAnalyticsPage />} />
          <Route path="/quick-add-settings" element={<QuickAddSettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/personalization" element={<PersonalizationPage />} />
          <Route path="/bundles" element={<QuickBundlesPage />} />
          <Route path="/forecast-calendar" element={<ForecastCalendarPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <QuickAddFAB />
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handler = CapApp.addListener('backButton', ({ canGoBack }) => {
      // If on home page, minimize app instead of closing
      if (location.pathname === '/') {
        CapApp.minimizeApp();
      } else if (canGoBack) {
        navigate(-1);
      } else {
        CapApp.minimizeApp();
      }
    });

    return () => {
      handler.then(h => h.remove());
    };
  }, [navigate, location.pathname]);

  return null;
}

const App = () => {
  useEffect(() => {
    initializeAds();
    onAppOpen();
    startAutoSync();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FinanceProvider>
          <Toaster />
          <Sonner />
          <AppLock>
            <AppContent />
          </AppLock>
        </FinanceProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

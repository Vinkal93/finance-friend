import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  return (
    <div className="pb-28 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Privacy Policy</h1>
      </div>

      <div className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <Shield className="w-8 h-8 text-primary mb-2" />
        <h2 className="text-base font-bold mb-1">Your data stays with you</h2>
        <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <article className="prose prose-sm max-w-none [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_p]:text-xs [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_li]:text-xs [&_li]:text-muted-foreground space-y-3 bg-card rounded-2xl p-5 card-shadow">
        <h2>1. Information we collect</h2>
        <p>Finance Friend stores your transactions, budgets, goals, settings, and preferences <b>locally on your device</b> using browser storage. We do not have a server collecting your financial data.</p>

        <h2>2. AI Assistant</h2>
        <p>When you use the AI Finance Assistant or AI auto-categorize, a summary of your finance data (categories, totals, recent transactions) is sent to our AI gateway to generate a response. No personally identifying information (name, phone, address) is required.</p>

        <h2>3. Recovery phone</h2>
        <p>The optional recovery phone number you set for PIN recovery is stored only on your device. We never transmit it.</p>

        <h2>4. Advertising</h2>
        <p>The app may show ads via Google AdMob. AdMob may collect device identifiers as outlined in Google's privacy policy. You can opt out from device settings (Google &rarr; Ads).</p>

        <h2>5. Analytics</h2>
        <p>We collect anonymous usage counters (ad impressions, session counts) stored locally for in-app metrics. These are not transmitted.</p>

        <h2>6. Data deletion</h2>
        <p>You can wipe all data anytime from Settings &rarr; Reset All Data. The action requires a 3-step confirmation and is irreversible.</p>

        <h2>7. Children's privacy</h2>
        <p>This app is not directed at children under 13. We do not knowingly collect data from children.</p>

        <h2>8. Contact</h2>
        <p>For privacy questions, reach out via the app store listing.</p>
      </article>
    </div>
  );
}

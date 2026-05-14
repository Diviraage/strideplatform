import { useEffect } from 'react';
import { Switch, Route, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AssessmentProvider } from '@/context/AssessmentContext';
import { Topbar } from '@/components/Topbar';

import IntroPage from '@/pages/IntroPage';
import AuthPage from '@/pages/AuthPage';
import ChoosePage from '@/pages/ChoosePage';
import Block1Page from '@/pages/Block1Page';
import Block2Page from '@/pages/Block2Page';
import Block3Page from '@/pages/Block3Page';
import BigFivePage from '@/pages/BigFivePage';
import SixteenPPage from '@/pages/SixteenPPage';
import SynthPage from '@/pages/SynthPage';
import ResultPage from '@/pages/ResultPage';
import PdfPage from '@/pages/PdfPage';
import ProfilePage from '@/pages/ProfilePage';
import SavedResultPage from '@/pages/SavedResultPage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#1A0A3D', color: '#fff' }}>
      <div className="bg-blob" />
      <Topbar />
      <main className="flex-1 relative z-10">
        <Switch>
          <Route path="/" component={IntroPage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/choose" component={ChoosePage} />
          <Route path="/assessment/block1" component={Block1Page} />
          <Route path="/assessment/block2" component={Block2Page} />
          <Route path="/assessment/block3" component={Block3Page} />
          <Route path="/assessment/bigfive" component={BigFivePage} />
          <Route path="/assessment/16p" component={SixteenPPage} />
          <Route path="/synth" component={SynthPage} />
          <Route path="/result" component={ResultPage} />
          <Route path="/pdf" component={PdfPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/result/:id" component={SavedResultPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AssessmentProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AssessmentProvider>
    </QueryClientProvider>
  );
}

export default App;

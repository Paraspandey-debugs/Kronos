import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Navigation } from './components/Navigation';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocsPage } from './pages/DocsPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { FlowEditorPage } from './pages/Flows/Editor';
import './index.css';

// Helper component for protected dashboard tabs
const ProtectedTab = ({ tab }: { tab: string }) => (
  <>
    <SignedIn>
      <DashboardLayout initialTab={tab} />
    </SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<><Navigation /><LandingPage /></>} />
          <Route 
            path="/dashboard" 
            element={
              <>
                <SignedIn>
                  <DashboardPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />
          <Route path="/flows" element={<ProtectedTab tab="Flows" />} />
          <Route path="/runs" element={<ProtectedTab tab="Runs" />} />
          <Route path="/assets" element={<ProtectedTab tab="Assets" />} />
          <Route path="/deployments" element={<ProtectedTab tab="Deployments" />} />
          <Route path="/settings" element={<ProtectedTab tab="Settings" />} />
          <Route 
            path="/flows/:id" 
            element={
              <>
                <SignedIn>
                  <FlowEditorPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />
          <Route path="/docs" element={<><Navigation /><DocsPage /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Navigation } from './components/Navigation';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocsPage } from './pages/DocsPage';
import { FlowsList } from './pages/Flows';
import { FlowEditorPage } from './pages/Flows/Editor';
import './index.css';

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
          <Route 
            path="/flows" 
            element={
              <>
                <SignedIn>
                  <Navigation /><FlowsList />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />
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

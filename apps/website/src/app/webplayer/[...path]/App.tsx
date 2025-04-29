'use client';

import React, { JSX, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, NavigateFunction, useNavigate, useLocation } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { userDataStore } from './state/userData';
import { authStore } from './state/auth';

// Import your components
import Feed from './pages/Feed';
import Audio from './pages/Audio';
import Search from './pages/Search';
import Channel from './pages/Channel';
import Profile from './pages/Profile';
import Company from './pages/Company';
import { AudioProvider } from './providers/AudioProvider';
import { AuthProvider } from './providers/AuthProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { TfIdfProvider } from './tfidf/tf-idf-provider';
import Playing from './pages/Playing';
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router';

const stores = { userDataStore, authStore };

interface InitialPathHandlerProps {
  initialPath: string;
}

interface DashboardAppProps {
  initialPath: string;
}

// Interface for userId param
interface UserParams {
  userId: string;
}

// This component handles syncing React Router with Next.js navigation
function NavigationSync({ onNavigate }: { onNavigate: (path: string) => void }) {
  const location = useLocation()

  useEffect(() => {
    // Notify parent component about navigation changes
    onNavigate(location.pathname)
  }, [location, onNavigate])

  return null
}

// This component handles the initial navigation
function InitialPathHandler({ initialPath }: { initialPath: string }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only navigate if the paths don't match
    if (initialPath && initialPath !== '/' && location.pathname === '/') {
      navigate(initialPath)
    }
  }, [initialPath, navigate, location.pathname])

  return null
}

export default function App({ initialPath }: DashboardAppProps): JSX.Element {
  //const nextRouter = useRouter();
  const handleNavigation = (path: string) => {
    if (path !== '/' && path !== initialPath) {
      //nextRouter.push(`/webplayer${path}`, undefined, { scroll: false })
    }
  }

  return (
    <Provider {...stores}>
      <BrowserRouter basename="/webplayer">
        <NavigationSync onNavigate={handleNavigation} />
        <InitialPathHandler initialPath={initialPath} />
        <NotificationProvider>
          <AuthProvider>
            <AudioProvider>
              <TfIdfProvider>
                <div>
                  {/* Main Content */}
                  <div className="mt-5 mr-5 ml-5 bg-dark w-100 page_container bg-dark text-white">
                    <Routes>
                      <Route path="/" element={<Feed />} />
                      <Route path="/audio/:audioId" element={<Audio />} />
                      <Route path="/channel/:channelId" element={<Channel />} />
                      <Route path="/feed" element={<Feed />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/playing" element={<Playing />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/company" element={<Company />} />
                    </Routes>
                  </div>
                </div>
              </TfIdfProvider>
            </AudioProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </Provider>
  );
};

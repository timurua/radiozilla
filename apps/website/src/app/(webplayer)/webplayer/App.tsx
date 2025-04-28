'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

const stores = { userDataStore, authStore };

const App: React.FC = () => {
  return (
    <Provider {...stores}>
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <AudioProvider>
              <TfIdfProvider>
                <div>
                  {/* Main Content */}
                  <div className="mt-5 mr-5 ml-5 bg-dark w-100 page_container bg-dark text-white">
                    <Routes>
                      <Route path="/webplayer" element={<Feed />} />
                      <Route path="/webplayer/audio/:audioId" element={<Audio />} />
                      <Route path="/webplayer/channel/:channelId" element={<Channel />} />
                      <Route path="/webplayer/feed" element={<Feed />} />
                      <Route path="/webplayer/search" element={<Search />} />
                      <Route path="/webplayer/playing" element={<Playing />} />
                      <Route path="/webplayer/profile" element={<Profile />} />
                      <Route path="/webplayer/company" element={<Company />} />
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

export default App;
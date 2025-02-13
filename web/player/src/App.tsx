import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  RecoilRoot,
} from 'recoil';

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


const App: React.FC = () => {
  return (
    <RecoilRoot>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    </RecoilRoot>

  );
};

export default App;
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  RecoilRoot,
} from 'recoil';

// Import your components
import Feed from './pages/Feed';
import Audio from './pages/Audio';
import Explore from './pages/Search';
import Profile from './pages/Profile';
import { AudioProvider } from './providers/AudioProvider';
import { AuthProvider } from './providers/AuthProvider';
import { NotificationProvider } from './providers/NotificationProvider';

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <AudioProvider>
              <div>
                {/* Main Content */}
                <div className="mt-5 mr-5 ml-5 bg-dark w-100 page_container bg-dark text-white">
                    <Routes>
                    <Route path="/" element={<Feed />} />
                    <Route path="/audio/:audio_id" element={<Audio />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/search" element={<Explore />} />
                    <Route path="/profile" element={<Profile />} />
                    </Routes>
                </div>
              </div>
            </AudioProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </RecoilRoot>

  );
};

export default App;
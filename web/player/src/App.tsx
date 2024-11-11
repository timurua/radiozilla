import React from 'react';
//import 'bootswatch/dist/darkly/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  RecoilRoot,
} from 'recoil';

// Import your components
import Listen from './pages/Listen';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import { AudioProvider } from './providers/AudioProvider';
import { AuthProvider } from './providers/AuthProvider';
import { NotificationProvider } from './providers/NotificationProvider';

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <NotificationProvider>
        <AuthProvider>
          <AudioProvider>
            <BrowserRouter>
              <div>
                {/* Main Content */}
                <div className="mt-5 mr-5 ml-5 bg-dark w-100 page_container">
                  <Routes>
                    <Route path="/" element={<Listen />} />
                    <Route path="/listen" element={<Listen />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/profile" element={<Profile isAuthenticated={false} />} />
                  </Routes>
                </div>
              </div>
            </BrowserRouter>
          </AudioProvider>
        </AuthProvider>
      </NotificationProvider>
    </RecoilRoot>

  );
};

export default App;
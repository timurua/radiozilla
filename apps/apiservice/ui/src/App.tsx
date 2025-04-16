import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import Root from './components/Root';
import { AuthProvider } from './providers/AuthProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import FrontendAudios from './routes/FrontendAudios';
import Health from './routes/Health';
import ViewWebPage from './routes/ViewWebPage';
import WebPageChannel from './routes/WebPageChannel';
import WebPageChannels from './routes/WebPageChannels';
import WebPageSummary from './routes/WebPageSummary';

const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', width: '100vw' }}>
      <RecoilRoot>
        <NotificationProvider>
          <AuthProvider>
            <BrowserRouter>
              <Root>
                <Routes>
                  <Route path="/" element={<Health />} />
                  <Route path="/health" element={<Health />} />
                  <Route path="/web-page-channel/:channelId" element={<WebPageChannel />} />
                  <Route path="/web-page-channel/:channelId/:activeTab" element={<WebPageChannel />} />
                  <Route path="/web-page-channels" element={<WebPageChannels />} />
                  <Route path="/web-pages" element={<ViewWebPage />} />
                  <Route path="/web-page-summary" element={<WebPageSummary />} />
                  <Route path="/frontend-audios" element={<FrontendAudios />} />
                </Routes>
              </Root>
            </BrowserRouter>
          </AuthProvider>
        </NotificationProvider>
      </RecoilRoot>
    </div>
  );
};

export default App;
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Health from './routes/Health';
import Root from './components/Root';
import WebPageChannel from './routes/WebPageChannel';
import WebPageChannels from './routes/WebPageChannels';
import ViewWebPage from './routes/ViewWebPage';
import WebPageSummary from './routes/WebPageSummary';
import FrontendAudios from './routes/FrontendAudios';

const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', width: '100vw' }}>
      <BrowserRouter>
      <Root>
        <Routes>
          <Route path="/" element={<Health />} />
          <Route path="/health" element={<Health />} />
          <Route path="/web-page-channel/:channelId" element={<WebPageChannel />} />
          <Route path="/web-page-channels" element={<WebPageChannels />} />
          <Route path="/web-pages" element={<ViewWebPage />} />
          <Route path="/web-page-summary" element={<WebPageSummary />} />
          <Route path="/frontend-audios" element={<FrontendAudios />} />
        </Routes>
      </Root>
      </BrowserRouter>
    </div>
  );
};

export default App;
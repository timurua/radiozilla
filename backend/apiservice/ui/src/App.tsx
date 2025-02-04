import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Health from './routes/Health';
import Root from './components/Root';
import Scraper from './routes/Scraper';
import WebPageSeeds from './routes/WebPageSeeds';
import ViewWebPage from './routes/ViewWebPage';
import WebPageSummary from './routes/WebPageSummary';
import FrontendAudios from './routes/FrontendAudios';

const App: React.FC = () => {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <BrowserRouter>
      <Root>
        <Routes>
          <Route path="/" element={<Health />} />
          <Route path="/health" element={<Health />} />
          <Route path="/scraper" element={<Scraper />} />
          <Route path="/web-page-seeds" element={<WebPageSeeds />} />
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
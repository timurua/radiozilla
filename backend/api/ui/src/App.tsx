import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Health from './routes/Health';
import Root from './components/Root';
import Similarity from './routes/Similarity';

const App: React.FC = () => {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <BrowserRouter>
      <Root>
        <Routes>
          <Route path="/" element={<Health />} />
          <Route path="/health" element={<Health />} />
          <Route path="/similarity" element={<Similarity />} />
        </Routes>
      </Root>
      </BrowserRouter>
    </div>
  );
};

export default App;
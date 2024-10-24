import React from 'react';
//import 'bootswatch/dist/darkly/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  RecoilRoot,
} from 'recoil';

// Import your components
import Player from './pages/Player';
import Profile from './pages/Profile';
import { AudioProvider } from './providers/AudioProvider';

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <AudioProvider>
        <div>

          {/* Main Content */}
          <Container className="mt-5 bg-dark w-100">
            <Routes>
              <Route path="/" element={<Player />} />
              <Route path="/player" element={<Player />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Container>
        </div>
        </AudioProvider>
      </BrowserRouter>
    </RecoilRoot>
    
  );
};

export default App;
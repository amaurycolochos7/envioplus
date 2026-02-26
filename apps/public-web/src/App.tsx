import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TrackingPage from './pages/TrackingPage';
import CotizarPage from './pages/CotizarPage';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cotizar" element={<CotizarPage />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/tracking/:trackingNumber" element={<TrackingPage />} />
        </Routes>
    );
}

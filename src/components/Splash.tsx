import React, { useEffect, useState } from 'react';
import { Droplet } from 'lucide-react';
import './Splash.css';

interface SplashProps {
    onFinish: () => void;
}

const Splash: React.FC<SplashProps> = ({ onFinish }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => setIsFadingOut(true), 1500);
        const timer2 = setTimeout(() => onFinish(), 2000); // 500ms fade duration

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onFinish]);

    return (
        <div className={`splash-screen ${isFadingOut ? 'fade-out' : ''}`}>
            <div className="splash-content">
                <div className="droplet-container">
                    <Droplet size={64} className="droplet-icon animate-float" />
                    <div className="ripple"></div>
                    <div className="ripple delay-1"></div>
                </div>
                <h1 className="splash-title">Water Bill Splitter</h1>
                <p className="splash-subtitle">Harisumiran</p>
            </div>
        </div>
    );
};

export default Splash;

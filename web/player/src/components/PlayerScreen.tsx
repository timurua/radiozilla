import React, { useRef } from 'react';
import BottomNavbar from './BottomNavbar';
import { SmallAudioPlayer } from './SmallAudioPlayer';
import TopNavbar from './TopNavbar';
import { useAudio } from "../providers/AudioProvider";

interface PlayerScreenProps extends React.HTMLProps<HTMLInputElement> {
    children?: React.ReactNode;
    noShowSmallPlayer?: boolean;
}
const PlayerScreen: React.FC<PlayerScreenProps> = ({ children, noShowSmallPlayer }) => {
    const topNavbarRef = useRef<HTMLDivElement>(null);

    const {
        rzAudio
    } = useAudio();


    return (
        <div className="min-vh-100 w-100 bg-dark text-white">

            <div ref={topNavbarRef}>
                <TopNavbar />
            </div>

            <div style={{ paddingTop: '50px', paddingBottom: '100px' }}>
                {children}
            </div>
            <div style={{ position: 'fixed', bottom: '0', width: '100%' }}>
                {
                    !noShowSmallPlayer && rzAudio ? (
                        <SmallAudioPlayer />
                    ) : null
                }
                <BottomNavbar />
            </div>
        </div>
    );
};

export default PlayerScreen;

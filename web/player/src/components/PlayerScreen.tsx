import React, { useRef } from 'react';
import BottomNavbar from './BottomNavbar';
import { SmallAudioPlayer } from './SmallAudioPlayer';
import TopNavbar from './TopNavbar';

export enum PlayerPosition {
    TOP = 'top',
    BOTTOM = 'bottom'
}

interface PlayerScreenProps extends React.HTMLProps<HTMLInputElement> {
    children?: React.ReactNode;
    playerPosition?: PlayerPosition;
    playerPositionOffset?: number;
}
const PlayerScreen: React.FC<PlayerScreenProps> = ({ children, playerPosition, playerPositionOffset }) => {
    const topNavbarRef = useRef<HTMLDivElement>(null);
    const minimizedStyle: React.CSSProperties = playerPosition === PlayerPosition.TOP
        ? {
            position: 'fixed',
            top: playerPositionOffset,
            width: '100%',
            left: 0,
            height: '50px', // Adjust the minimized height as needed
            zIndex: 1000,
            paddingTop: '0px',
            paddingLeft: '10px',
            paddingRight: '10px',
        } : { display: 'none' };

    return (
        <div className="min-vh-100 w-100 bg-dark text-white">

            <div ref={topNavbarRef}>
                <TopNavbar />
            </div>

            {
                playerPosition === PlayerPosition.TOP ? (
                    <div style={minimizedStyle} className='bg-dark slide-in'>
                        <SmallAudioPlayer />
                    </div>
                ) : null
            }

            <div style={{ paddingTop: '50px', paddingBottom: '100px' }}>
                {children}
            </div>
            <BottomNavbar />
        </div>
    );
};

export default PlayerScreen;

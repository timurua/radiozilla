'use client';

import React, { useEffect, useRef } from 'react';
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
    const childrenRef = useRef<HTMLDivElement>(null);

    const {
        rzAudio
    } = useAudio();

    useEffect(() => {
        childrenRef.current?.scrollTo({ top: -100, behavior: 'instant' })
    }, []);


    return (
        <div style={{ paddingTop: '50px', paddingBottom: '120px' }} className="min-vh-100 w-100 bg-dark text-white">

            <div ref={topNavbarRef}>
                <TopNavbar />
            </div>

            <div ref={childrenRef} >
                {children}
            </div>
            <div className='bg-dark w-100 border-top border-secondary' style={{ position: 'fixed', left: '0', right: '0', bottom: '0' }}>
                <div style={{ width: '100%', paddingLeft: '20px', paddingRight: '20px' }}>
                    {
                        !noShowSmallPlayer && rzAudio ? (
                            <SmallAudioPlayer />
                        ) : null
                    }
                    <BottomNavbar />
                </div>
            </div>
        </div>
    );
};

export default PlayerScreen;

'use client';

import React, { JSX, useRef } from 'react';
import BottomNavbar from './BottomNavbar';
import TopNavbar from './TopNavbar';

function NoPlayerScreen({ children }: { children: React.ReactNode }): JSX.Element {
    const topNavbarRef = useRef<HTMLDivElement>(null);



    return (
        <div className="min-vh-100 w-100 bg-dark text-white">

            <div ref={topNavbarRef}>
                <TopNavbar />
            </div>

            <div style={{ paddingTop: '50px', paddingBottom: '100px' }}>
                {children}
            </div>
            <BottomNavbar />
        </div>
    );
};

export default NoPlayerScreen;

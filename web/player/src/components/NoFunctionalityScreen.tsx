import React from 'react';
import BottomNavbar from '../components/BottomNavbar';
import TopNavbar from '../components/TopNavbar';

interface NoFunctionalityScreenProps {
    children: React.ReactNode;
}

function NoFunctionalityScreen({ children }: NoFunctionalityScreenProps) {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white px-3">
            <TopNavbar />
            <div className="flex-grow-1 d-flex justify-content-center align-items-center w-100">
            {children}
            </div>
            <BottomNavbar />
        </div>
    );
}

export default NoFunctionalityScreen;

'use client';

import { JSX, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Define types for the DashboardApp props
interface PlayerAppProps {
    initialPath: string;
}

// Import React Router components with no SSR
const PlayerApp = dynamic<PlayerAppProps>(
    () => import('./App'),
    { ssr: false }
);

export default function PathedPlayerApp() {
    const pathname = usePathname()
    const clientPath = pathname?.replace('/webplayer', '') || '/'

    return (
        <PlayerApp initialPath={clientPath} />
    )
}



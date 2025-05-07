'use client'; // Mark this as a client component

import { Provider } from 'mobx-react';
import { userDataStore } from '@/components/webplayer/state/userData';
import { ReactNode } from 'react';

const stores = { userDataStore };

export default function MobxProvider({ children }: { children: ReactNode }) {
    return <Provider {...stores}>{children}</Provider>;
}
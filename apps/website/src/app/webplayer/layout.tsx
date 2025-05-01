'use client';

import React, { JSX } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Provider } from 'mobx-react';
import { userDataStore } from '@/components/webplayer/state/userData';
import { authStore } from '@/components/webplayer/state/auth';
import { AudioProvider } from '@/components/webplayer/providers/AudioProvider';
import { AuthProvider } from '@/components/webplayer/providers/AuthProvider';
import { NotificationProvider } from '@/components/webplayer/providers/NotificationProvider';
import { TfIdfProvider } from '@/components/webplayer/tfidf/tf-idf-provider';
const stores = { userDataStore, authStore };


export default function App({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <Provider {...stores}>
            <NotificationProvider>
                <AuthProvider>
                    <AudioProvider>
                        <TfIdfProvider>
                            <div>
                                {/* Main Content */}
                                <div className="mt-5 mr-5 ml-5 bg-dark w-100 page_container bg-dark text-white">
                                    {children}
                                </div>
                            </div>
                        </TfIdfProvider>
                    </AudioProvider>
                </AuthProvider>
            </NotificationProvider>
        </Provider>
    );
};

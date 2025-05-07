'use client';

import React, { JSX } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AudioProvider } from '@/components/webplayer/providers/AudioProvider';
import { NotificationProvider } from '@/components/webplayer/providers/NotificationProvider';
import { TfIdfProvider } from '@/components/webplayer/tfidf/tf-idf-provider';


export default function App({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <NotificationProvider>
            <AudioProvider>
                <TfIdfProvider>
                    <div className='bg-dark text-white'>
                        {/* Main Content */}
                        <div className="mt-5 mr-5 ml-5 bg-dark w-100 page_container bg-dark text-white">
                            {children}
                        </div>
                    </div>
                </TfIdfProvider>
            </AudioProvider>
        </NotificationProvider>
    );
};

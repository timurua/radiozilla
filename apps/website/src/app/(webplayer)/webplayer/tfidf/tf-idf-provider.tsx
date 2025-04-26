'use client';

import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { TfIdf } from './tf-idf';
import { TfIdfSearchResult, TfIdfDocument } from './types';
import { useAuth } from '../providers/AuthProvider';
import { getSearchDocuments } from '../data/actions';

interface TfIdfContextType {
    addDocuments: (documents: TfIdfDocument[]) => Promise<void>;
    search: (query: string, topK?: number) => Promise<TfIdfSearchResult[]>;
}

const TfIdfContext = createContext<TfIdfContextType | null>(null);

interface TfIdfProviderProps {
    children: React.ReactNode;
    batchSize?: number;
}

export const TfIdfProvider: React.FC<TfIdfProviderProps> = ({
    children
}) => {
    const tfIdf = useMemo(() => {
        return new TfIdf(1000);
    }, []);
    const { user } = useAuth();

    useEffect(() => {
        const fetchDocuments = async () => {
            if (user) {
                const documents = await getSearchDocuments();
                tfIdf.addDocuments(documents);
            };
        }
        fetchDocuments();
    }, [tfIdf, user]);

    useEffect(() => {
        return () => {
            tfIdf.dispose();
        };
    }, [tfIdf]);

    const addDocuments = useCallback(async (documents: TfIdfDocument[]) => {
        await tfIdf.addDocuments(documents);
    }, [tfIdf]);

    const search = useCallback(async (query: string, topK?: number) => {
        return tfIdf.search(query, topK);
    }, [tfIdf]);

    const value = useMemo(() => ({
        addDocuments,
        search
    }), [addDocuments, search]);

    return (
        <TfIdfContext.Provider value={value}>
            {children}
        </TfIdfContext.Provider>
    );
};

export const useTfIdf = () => {
    const context = useContext(TfIdfContext);
    if (!context) {
        throw new Error('useTfIdf must be used within a TfIdfProvider');
    }
    return context;
};
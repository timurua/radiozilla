export interface DocumentIndex {
    [term: string]: {
        [docId: string]: number;
    };
}

export interface IdfIndex {
    [term: string]: number;
}

export interface TfIdfSearchResult {
    docId: string;
    score: number;
}

export interface TfIdfWorkerMessage {
    type: 'ADD_DOCUMENT' | 'ADD_DOCUMENTS' | 'SEARCH' | 'INDEX_UPDATED';
    requestId: string;
    payload: {
        id?: string;
        text?: string;
        metadata?: Record<string, unknown>;
    };
}

export interface TfIdfDocument {
    docId: string;
    text: string;
}

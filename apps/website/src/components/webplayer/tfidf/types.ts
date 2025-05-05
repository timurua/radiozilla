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

export interface TfIdfSearchRequest {
    query: string;
    topK?: number;
}

export interface TfIdfAddDocumentsRequest {
    documents: TfIdfDocument[];
}

export interface TfIdfWorkerMessage {
    type: 'ADD_DOCUMENTS' | 'SEARCH' | 'INDEX_UPDATED';
    requestId: string;
    payload: TfIdfSearchRequest | TfIdfAddDocumentsRequest;
}

export interface TfIdfDocument {
    docId: string;
    text: string;
}

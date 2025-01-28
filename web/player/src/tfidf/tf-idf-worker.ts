import { DocumentIndex, IdfIndex, TfIdfSearchResult, TfIdfWorkerMessage, TfIdfDocument } from './types';
import { LevenshteinSearchIndex } from './tf-idf-levenstein';

class TfIdfWorker {
    private documents: Map<string, string>;
    private documentIndex: DocumentIndex;
    private idfIndex: IdfIndex;
    private levensteinSearchIndex: LevenshteinSearchIndex;

    constructor() {
        this.documents = new Map();
        this.documentIndex = {};        
        this.idfIndex = {};
        this.levensteinSearchIndex = new LevenshteinSearchIndex([]);
    }

    private tokenize(text: string): string[] {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(term => term.length > 0);
    }

    private calculateTermFrequency(terms: string[]): { [term: string]: number } {
        const termFreq: { [term: string]: number } = {};

        terms.forEach(term => {
            termFreq[term] = (termFreq[term] || 0) + 1;
        });

        const docLength = terms.length;
        Object.keys(termFreq).forEach(term => {
            termFreq[term] = termFreq[term] / docLength;
        });

        return termFreq;
    }

    private calculateIdf(): void {
        const N = this.documents.size;
        const documentFreq: { [term: string]: number } = {};

        Object.keys(this.documentIndex).forEach(term => {
            documentFreq[term] = Object.keys(this.documentIndex[term]).length;
        });

        Object.keys(documentFreq).forEach(term => {
            this.idfIndex[term] = Math.log(N / (documentFreq[term] || 1));
        });
    }

    addDocuments(documents: TfIdfDocument[]) {
        for (const { docId, text } of documents) {
            this.documents.set(docId, text);
            const terms = this.tokenize(text);
            const termFreq = this.calculateTermFrequency(terms);

            Object.entries(termFreq).forEach(([term, freq]) => {
                if (!this.documentIndex[term]) {
                    this.documentIndex[term] = {};
                }
                this.documentIndex[term][docId] = freq;
            });
        }

        this.calculateIdf();
        this.levensteinSearchIndex = new LevenshteinSearchIndex(Object.keys(this.idfIndex));
    }

    search(query: string, topK: number = 5): TfIdfSearchResult[] {
        const queryTermsBeforeLevenstein = this.tokenize(query);
        const queryTerms: string[] = []        
        for (const term of queryTermsBeforeLevenstein) {
            if (this.idfIndex[term]) {
                queryTerms.push(term);
            } else {
                const suggestions = this.levensteinSearchIndex.search(term, 1);
                if (suggestions.length > 0) {
                    queryTerms.push(suggestions[0].word);
                }
            }
        }
        const queryVector = this.calculateTermFrequency(queryTerms);
        const scores: { [docId: string]: number } = {};

        this.documents.forEach((_, docId) => {
            let score = 0;

            Object.entries(queryVector).forEach(([term, queryTermFreq]) => {
                if (this.documentIndex[term]?.[docId]) {
                    const tf = this.documentIndex[term][docId];
                    const idf = this.idfIndex[term] || 0;
                    score += queryTermFreq * tf * idf;
                }
            });

            if (score > 0) {
                scores[docId] = score;
            }
        });

        return Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, topK)
            .map(([docId, score]) => ({ docId, score }));
    }
}

const worker = new TfIdfWorker();

self.addEventListener('message', (event: MessageEvent<TfIdfWorkerMessage>) => {
    const { type, requestId, payload } = event.data;

    switch (type) {
        case 'ADD_DOCUMENTS':
            worker.addDocuments(payload.documents);
            self.postMessage({ type: 'ADD_DOCUMENTS', requestId, payload: null });
            break;
        case 'SEARCH':
            const results = worker.search(payload.query, payload.topK);
            self.postMessage({ type: 'SEARCH', requestId, payload: results });
            break;
    }
});
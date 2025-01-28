import { TfIdfSearchResult, TfIdfDocument } from './types';

export class TfIdf {
    private batchSize: number = 100;
    private worker: Worker;

    constructor(batchSize: number = 100) {
        this.batchSize = batchSize;
        this.worker = new Worker(new URL('./tf-idf-worker.ts', import.meta.url));
    }

    private async sendReceive<TRequest, TReply>(
        type: string, 
        payload: TRequest
    ): Promise<TReply> {
        const requestId = Math.random().toString(36);
        
        return new Promise((resolve) => {
            const handler = (event: MessageEvent) => {
                if (event.data.type === type && event.data.requestId === requestId) {
                    this.worker.removeEventListener('message', handler);
                    resolve(event.data.payload);
                }
            };

            this.worker.addEventListener('message', handler);
            this.worker.postMessage({
                type,
                requestId,
                payload
            });
        });
    }

    private async addBatch(documents: TfIdfDocument[]): Promise<void> {
        return this.sendReceive('ADD_DOCUMENTS', { documents });
    }    

    async addDocuments(documents: TfIdfDocument[]) {
        const promises: Promise<void>[] = [];
        for (let i = 0; i < documents.length; i += this.batchSize) {
            const batch = documents.slice(i, i + this.batchSize);
            promises.push(this.addBatch(batch));            
        }
        await Promise.all(promises);
    }

    async search(query: string, topK: number = 5): Promise<TfIdfSearchResult[]> {
        return this.sendReceive('SEARCH', { query, topK });
    }

    dispose(): void {
        this.worker.terminate();
    }
}
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export interface Batch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documents: any[];
    startIndex: number;
    batchSize: number;
    hasMore: boolean;
}

export const fetchDocumentByIds = async (collectionName: string, ids: string[], startIndex: number, batchSize: number): Promise<Batch> => {
    const batch = ids.slice(startIndex, startIndex + batchSize);
    const q = query(
        collection(db, collectionName),
        where('__name__', 'in', batch) // __name__ is a special field that represents the document ID
    );
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => doc.data());

    return Promise.resolve({
        documents,
        startIndex: startIndex + batchSize,
        batchSize,
        hasMore: startIndex + batchSize < ids.length,
    });
}
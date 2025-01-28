interface SearchResult {
    word: string;
    distance: number;
}

/**
 * A class that preprocesses and indexes words for efficient Levenshtein distance searches
 */
export class LevenshteinSearchIndex {
    private wordMap: Map<string, string[]>;
    private lengthMap: Map<number, Set<string>>;
    private characterSets: Map<string, Set<string>>;
    private dictionary: string[];

    constructor(dictionary: string[]) {
        this.dictionary = dictionary.map(word => word.toLowerCase());
        this.wordMap = new Map();
        this.lengthMap = new Map();
        this.characterSets = new Map();
        this.preprocess();
    }

    /**
     * Preprocesses the dictionary to create various indexes for optimization
     */
    private preprocess(): void {
        // Index words by length
        this.dictionary.forEach(word => {
            const length = word.length;
            if (!this.lengthMap.has(length)) {
                this.lengthMap.set(length, new Set());
            }
            this.lengthMap.get(length)!.add(word);

            // Create character set for each word
            const charSet = new Set(word.split(''));
            this.characterSets.set(word, charSet);

            // Index by character signature
            const signature = this.getCharacterSignature(word);
            if (!this.wordMap.has(signature)) {
                this.wordMap.set(signature, []);
            }
            this.wordMap.get(signature)!.push(word);
        });
    }

    /**
     * Creates a character signature for a word (sorted unique characters)
     */
    private getCharacterSignature(word: string): string {
        return Array.from(new Set(word.split(''))).sort().join('');
    }

    /**
     * Calculates Levenshtein distance with early termination when exceeding maxDistance
     */
    private levenshteinDistanceWithLimit(source: string, target: string, maxDistance: number): number {
        if (Math.abs(source.length - target.length) > maxDistance) {
            return maxDistance + 1;
        }

        // Character frequency difference optimization
        const sourceChars = new Set(source);
        const targetChars = new Set(target);
        const charDiff = new Set([...sourceChars].filter(x => !targetChars.has(x))).size +
                        new Set([...targetChars].filter(x => !sourceChars.has(x))).size;
        if (charDiff > maxDistance * 2) {
            return maxDistance + 1;
        }

        const sourceLength = source.length;
        const targetLength = target.length;

        let previousRow = new Array<number>(sourceLength + 1);
        for (let i = 0; i <= sourceLength; i++) {
            previousRow[i] = i;
        }

        for (let j = 1; j <= targetLength; j++) {
            let currentRow = [j];
            let minDistance = j;

            for (let i = 1; i <= sourceLength; i++) {
                const substitutionCost = source[i - 1] === target[j - 1] ? 0 : 1;
                const distance = Math.min(
                    currentRow[i - 1] + 1,
                    previousRow[i] + 1,
                    previousRow[i - 1] + substitutionCost
                );
                currentRow[i] = distance;
                minDistance = Math.min(minDistance, distance);
            }

            // Early termination if we can't reach maxDistance
            if (minDistance > maxDistance) {
                return maxDistance + 1;
            }

            previousRow = currentRow;
        }

        return previousRow[sourceLength];
    }

    /**
     * Searches for words within maxDistance of the target word
     */
    public search(targetWord: string, maxDistance: number): SearchResult[] {
        if (maxDistance < 0) {
            throw new Error('maxDistance must be non-negative');
        }

        const processedTarget = targetWord.toLowerCase();
        const targetLength = processedTarget.length;
        const candidates = new Set<string>();

        // Collect candidates based on length
        for (let len = targetLength - maxDistance; len <= targetLength + maxDistance; len++) {
            const wordsWithLength = this.lengthMap.get(len);
            if (wordsWithLength) {
                wordsWithLength.forEach(word => candidates.add(word));
            }
        }

        // Filter candidates by character set difference
        const targetCharSet = new Set(processedTarget.split(''));
        const results: SearchResult[] = [];

        for (const candidate of candidates) {
            const candidateCharSet = this.characterSets.get(candidate)!;
            
            // Calculate character set difference
            const diffCount = new Set([...targetCharSet].filter(x => !candidateCharSet.has(x))).size +
                            new Set([...candidateCharSet].filter(x => !targetCharSet.has(x))).size;

            // Skip if character difference exceeds possible edits
            if (diffCount > maxDistance * 2) {
                continue;
            }

            const distance = this.levenshteinDistanceWithLimit(processedTarget, candidate, maxDistance);
            if (distance <= maxDistance) {
                results.push({
                    word: candidate,
                    distance: distance
                });
            }
        }

        return results.sort((a, b) => a.distance - b.distance);
    }
}

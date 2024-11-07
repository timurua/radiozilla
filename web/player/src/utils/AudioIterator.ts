import { RZAudio } from "../data/model";

class AudioIterator {
    private audios: RZAudio[];
    private index: number;

    constructor(audios: RZAudio[]) {
        this.audios = audios;
        this.index = 0;
    }

    public current(): RZAudio | null {
        if (this.index >= 0 && this.index < this.audios.length) {
            return this.audios[this.index];
        }
        return null;
    }

    public next(): RZAudio | null {
        if (this.index < this.audios.length - 1) {
            this.index++;
            return this.audios[this.index];
        }
        return null; // No more elements
    }

    public previous(): RZAudio | null {
        if (this.index > 0) {
            this.index--;
            return this.audios[this.index];
        }
        return null; // No previous element
    }

    public hasNext(): boolean {
        return this.index < this.audios.length - 1;
    }

    public hasPrevious(): boolean {
        return this.index > 0;
    }
}
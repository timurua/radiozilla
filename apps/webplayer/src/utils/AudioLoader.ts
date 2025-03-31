import { RZAudio } from "../data/model";

export type Subscriber = () => void;

export default interface AudioLoader {
    getPreviosAudio(audio: RZAudio): Promise<RZAudio | null>;
    getNextAudio(audio: RZAudio | null): Promise<RZAudio | null>;
    getNextAudioPage(): Promise<void>;
    getAudios(): RZAudio[];
    isComplete(): boolean;
    subscribe(callback: Subscriber): () => void;
}
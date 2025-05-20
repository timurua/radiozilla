import { getAudioListByIds, getNextAudioPageAction } from "@/lib/db/client";
import { PlayableFeedMode, RZAudio } from "./model";
import AudioLoader, { Subscriber } from '../utils/AudioLoader';

export class SubscriberAudioLoader {
    private subscribers: Set<Subscriber> = new Set();

    public subscribe(callback: Subscriber): () => void {
        this.subscribers.add(callback);
        callback();
        return () => {
            this.subscribers.delete(callback);
        };
    }

    protected notifySubscribers(): void {
        this.subscribers.forEach(callback => callback());
    }
}

export class SingleAudioLoader extends SubscriberAudioLoader implements AudioLoader {
    private audio: RZAudio;

    constructor(audio: RZAudio) {
        super();
        this.audio = audio;
    }

    async getPreviosAudio(__audio: RZAudio): Promise<RZAudio | null> {
        return null;
    }

    async getNextAudio(__audio: RZAudio): Promise<RZAudio | null> {
        return null;
    }

    async getNextAudioPage(): Promise<void> {
        return;
    }

    getAudios(): RZAudio[] {
        return [this.audio];
    }

    isComplete(): boolean {
        return true;
    }
}

export class IdsAudioLoader extends SubscriberAudioLoader implements AudioLoader {
    private audioIds: string[];
    private audios: RZAudio[] = [];
    private pageSize: number;
    private isLoading: boolean = false;

    constructor(audioIds: string[], pageSize: number = 20) {
        super();
        this.audioIds = audioIds;
        this.pageSize = pageSize;
    }

    async getPreviosAudio(audio: RZAudio): Promise<RZAudio | null> {
        const index = this.audios.findIndex(a => a.id === audio.id);
        if (index < 0) {
            throw new Error('Audio not found in list');
        }
        if (index > 0) {
            return this.audios[index - 1];
        }
        return null;
    }

    async getNextAudio(audio: RZAudio): Promise<RZAudio | null> {
        const index = this.audios.findIndex(a => a.id === audio.id);
        if (index < 0) {
            throw new Error('Audio not found in list');
        }
        if (index < this.audios.length - 1) {
            return this.audios[index + 1];
        }
        if (this.audios.length < this.audioIds.length) {
            await this.getNextAudioPage();
            return this.audios[index + 1];
        }
        return null;
    }

    async getNextAudioPage(): Promise<void> {
        if (this.audios.length === this.audioIds.length) {
            return;
        }
        if (this.isLoading) {
            return;
        }
        this.isLoading = true;
        const audioIds = this.audioIds.slice(this.audios.length, this.audios.length + this.pageSize);
        const nextPageAudios = await getAudioListByIds(audioIds);
        this.audios.push(...nextPageAudios);
        this.notifySubscribers();
        this.isLoading = false;
    }

    getAudios(): RZAudio[] {
        return this.audios;
    }

    isComplete(): boolean {
        return this.audios.length === this.audioIds.length;
    }
}

export class MultiAudioLoader extends SubscriberAudioLoader implements AudioLoader {

    private audios: RZAudio[];

    constructor(audios: RZAudio[]) {
        super();
        this.audios = audios;
    }

    async getPreviosAudio(audio: RZAudio): Promise<RZAudio | null> {
        const index = this.audios.findIndex(a => a.id === audio.id);
        if (index < 0) {
            throw new Error('Audio not found in list');
        }
        if (index > 0) {
            return this.audios[index - 1];
        }
        return null;
    }

    async getNextAudio(audio: RZAudio): Promise<RZAudio | null> {
        const index = this.audios.findIndex(a => a.id === audio.id);
        if (index < 0) {
            throw new Error('Audio not found in list');
        }
        if (index < this.audios.length - 1) {
            return this.audios[index + 1];
        }
        return null;
    }

    async getNextAudioPage(): Promise<void> {
        return;
    }

    getAudios(): RZAudio[] {
        return this.audios;
    }

    isComplete(): boolean {
        return true;
    }
}

export class FeedAudioLoader extends SubscriberAudioLoader implements AudioLoader {

    private audios: RZAudio[] = [];
    private pageSize: number;
    private loadingPromise: Promise<void> | null = null;
    private loadIsComplete: boolean = false;
    private lastPublishedAt: Date | null = null;
    private mode = PlayableFeedMode.Latest;
    private subscribedChannelIds: Set<string>;

    constructor(mode: PlayableFeedMode, subscribedChannelIds: string[], pageSize: number = 20) {
        super();
        this.pageSize = pageSize;
        this.mode = mode;
        this.subscribedChannelIds = new Set(subscribedChannelIds);
    }

    async getPreviosAudio(audio: RZAudio): Promise<RZAudio | null> {
        const index = this.audios.findIndex(a => a.id === audio.id);
        if (index < 0) {
            return this.audios[0];
        }
        if (index > 0) {
            return this.audios[index - 1];
        }
        return null;
    }

    async getNextAudio(audio: RZAudio): Promise<RZAudio | null> {
        let index = this.audios.findIndex(a => a.id === audio.id);
        if (index < 0) {
            index = 0;
        }
        return await this.getAudioAtIndex(index + 1);
    }

    async getNextAudioPage(): Promise<void> {
        await this.getAudioAtIndex(this.audios.length - 1 + this.pageSize);
    }

    private async getAudioAtIndex(index: number): Promise<RZAudio | null> {
        if (index < 0) {
            throw new Error('Index must be greater than 0');
        }
        if (index < this.audios.length) {
            return this.audios[index];
        }
        if (this.loadIsComplete) {
            return null;
        }
        while (!this.loadIsComplete && index >= this.audios.length) {
            await this.getNextAudioPageShot();
        }

        if (index < this.audios.length) {
            return this.audios[index];
        }
        return null;
    }

    getAudios(): RZAudio[] {
        return this.audios;
    }

    private async getNextAudioPageInternal(): Promise<void> {
        const result = await getNextAudioPageAction(this.lastPublishedAt, this.pageSize);
        let resultAudios = result.audios
        this.lastPublishedAt = result.lastPublishedAt;
        this.loadIsComplete = result.loadIsComplete;

        if (this.mode == PlayableFeedMode.Subscribed) {
            resultAudios = resultAudios.filter(rzAudio => this.subscribedChannelIds.has(rzAudio.channel.id));
        }
        const playedAudioIdsSet = new Set(this.audios.map(a => a.id));
        resultAudios = resultAudios.filter(rzAudio => !playedAudioIdsSet.has(rzAudio.id));
        this.audios.push(...resultAudios);
        this.notifySubscribers();
    }

    private async getNextAudioPageShot(): Promise<void> {
        if (this.loadingPromise) {
            await this.loadingPromise;
        }
        this.loadingPromise = this.getNextAudioPageInternal();
        await this.loadingPromise;
        this.loadingPromise = null;
        return;
    }

    isComplete(): boolean {
        return this.loadIsComplete;
    }
}
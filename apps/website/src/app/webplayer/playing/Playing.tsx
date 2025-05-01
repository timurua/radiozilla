'use client';

import { Suspense } from 'react';
import PlayerScreen from '@/components/webplayer/components/PlayerScreen';
import { SuspenseLoading } from '@/components/webplayer/components/SuspenseLoading';
import { AudioList } from '@/components/webplayer/components/AudioList';
import { useAudio } from '@/components/webplayer/providers/AudioProvider';

function InnerPlaying() {
    const { audioLoader } = useAudio();

    if (!audioLoader) {
        return <div>No audio playlist available</div>;
    }

    return (
        <div>
            <h5 className="mb-4">Currently Playing</h5>
            <AudioList
                audioLoader={audioLoader}
                showDates={false}
            />
        </div>
    );
}

function Playing() {
    return (
        <PlayerScreen>
            <Suspense fallback={<SuspenseLoading />}>
                <InnerPlaying />
            </Suspense>
        </PlayerScreen>
    );
}

export default Playing;

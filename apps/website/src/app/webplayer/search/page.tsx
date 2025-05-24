'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Form, FormControl, InputGroup } from 'react-bootstrap';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import AudioList from '@/components/webplayer/components/AudioList';
import PlayerScreen from '@/components/webplayer/components/PlayerScreen';
import { IdsAudioLoader } from '@/components/webplayer/data/loaders';
import { useTfIdf } from '@/components/webplayer/tfidf/tf-idf-provider';
import AudioLoader from '@/components/webplayer/utils/AudioLoader';

function Search() {

    const pathname = usePathname();
    const router = useRouter();
    const { search } = useTfIdf();
    const inputRef = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const [audioLoader, setAudioLoader] = useState<AudioLoader | null>(null);

    const searchValue = searchParams.get('query') || '';

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newParams = new URLSearchParams(searchParams)
        newParams.set("query", event.target.value);
        router.replace(`${pathname}?${newParams.toString()}`);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        inputRef.current?.blur();
    };

    useEffect(() => {
        const searchIndex = async () => {
            const documents = await search(searchValue, 50);
            setAudioLoader(new IdsAudioLoader(documents.map(doc => doc.docId)));
        }
        searchIndex();
    }, [searchValue, search]);

    return (
        <PlayerScreen>
            <Form onSubmit={handleSubmit}>
                <InputGroup>
                    <FormControl
                        type="search"
                        ref={inputRef}
                        value={searchValue}
                        onChange={handleInputChange}
                        className="border rounded-start-pill rounded-end-pill bg-dark text-light w-100"
                        placeholder='Search'
                        style={{ boxShadow: 'none' }}
                    />
                </InputGroup>
            </Form>
            {audioLoader && <AudioList audioLoader={audioLoader} showDates={false} />}
        </PlayerScreen>
    );
}

export default Search;

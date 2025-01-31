import React, { useEffect, useRef, useState } from 'react';
import { Col, Form, FormControl, InputGroup, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import AudioList from '../components/AudioList';
import PlayerScreen from '../components/PlayerScreen';
import { getAudioListByIds } from '../data/firebase';
import { RZAudio } from '../data/model';
import { useAudio } from '../providers/AudioProvider';
import { useTfIdf } from '../tfidf/tf-idf-provider';

function Search() {

    const [rzAudios, setRZAudios] = useState<RZAudio[]>([]);
    const { search } = useTfIdf();
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const {setRzAudios:setPlayerAudios} = useAudio();

    const searchValue = searchParams.get('query') || '';

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newParams = new URLSearchParams(searchParams)
        newParams.set("query", event.target.value);
        setSearchParams(newParams);
    };

    const onAudioClick = () => {
        setPlayerAudios(rzAudios);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        inputRef.current?.blur();
    };

    useEffect(() => {
        const searchIndex = async () => {
            const documents = await search(searchValue, 50);
            const audios = await getAudioListByIds(documents.map(doc => doc.docId));
            setRZAudios(audios);
        }
        searchIndex();
    }, [searchValue]);

    return (
        <PlayerScreen>
            <Row>
                <Col md={5} className="mx-auto">
                    <Form onSubmit={handleSubmit}>
                        <InputGroup>
                            <FormControl
                                type="search"
                                ref={inputRef}
                                value={searchValue}
                                onChange={handleInputChange}
                                className="border rounded-start-pill rounded-end-pill bg-dark text-light"
                                placeholder='Search'
                                style={{ boxShadow: 'none' }}
                            />
                        </InputGroup>
                    </Form>
                </Col>
            </Row>
            <AudioList rzAudios={rzAudios} onClick={onAudioClick} /> 
        </PlayerScreen>
    );
}

export default Search;

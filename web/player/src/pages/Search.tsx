import React, { useEffect, useRef, useState } from 'react';
import { Card, Col, Form, FormControl, InputGroup, ListGroup, Row } from 'react-bootstrap';
import PlayerScreen from '../components/PlayerScreen';
import { getAudioListByIds } from '../data/firebase';
import { RZAudio } from '../data/model';
import { useTfIdf } from '../tfidf/tf-idf-provider';
import { AudioListItem } from '../components/AudioListItem';
import { useSearchParams } from 'react-router-dom';

function Search() {

    const [rzAudios, setRZAudios] = useState<RZAudio[]>([]);
    const { search } = useTfIdf();
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const searchValue = searchParams.get('query') || '';

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newParams = new URLSearchParams(searchParams)
        newParams.set("query", event.target.value);
        setSearchParams(newParams);
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
            <div className='mt-5'>
                <Card className='bg-dark text-white mt-3 no-border'>
                    <Card.Body>
                        <ListGroup variant="flush" className='bg-dark text-white'>
                            {rzAudios.length === 0 ? (
                                null
                            ) : rzAudios.map((rzAudio) => (
                                <AudioListItem key={rzAudio.id} rzAudio={rzAudio} />
                            ))}
                        </ListGroup>

                    </Card.Body>
                </Card>
            </div>
        </PlayerScreen>
    );
}

export default Search;

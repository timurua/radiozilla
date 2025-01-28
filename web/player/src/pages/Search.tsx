import React, { useEffect, useState } from 'react';
import { Button, Card, Col, FormControl, InputGroup, ListGroup, Row } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import PlayerScreen from '../components/PlayerScreen';
import { getAudioListByIds } from '../data/firebase';
import { RZAudio } from '../data/model';
import { useTfIdf } from '../tfidf/tf-idf-provider';
import { AudioListItem } from '../components/AudioListItem';


function Search() {

    const [searchValue, setSearchValue] = useState('');
    const [rzAudios, setRZAudios] = useState<RZAudio[]>([]);
    const { search } = useTfIdf();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleSearchButtonClick = () => {
        if (searchValue) {
        }
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
                    <InputGroup>
                        <FormControl
                            type="search"
                            value={searchValue}
                            onChange={handleInputChange}
                            className="border-end-0 border rounded-start-pill bg-dark text-light"
                            placeholder='Search'
                            style={{ boxShadow: 'none' }}
                        />
                        <Button
                            variant="outline-light"
                            className="rounded-end-pill ms-n5 bg-dark"
                            type="button"
                            onClick={handleSearchButtonClick}
                        >
                            {<FaSearch />}
                        </Button>
                    </InputGroup>
                </Col>
            </Row>
            <div className='mt-5'>
                <Card className='bg-dark text-white mt-3 border-secondary'>
                    <Card.Body>
                        <Card.Title>History</Card.Title>
                        <ListGroup variant="flush" className='bg-dark text-white'>
                            {rzAudios.length === 0 ? (
                                <ListGroup.Item className='bg-dark text-white'>No Audios</ListGroup.Item>
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

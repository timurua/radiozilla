import React, { useState } from 'react';
import { Button, Col, FormControl, InputGroup, Row } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { AudioList } from '../components/AudioList';
import PlayerScreen from '../components/PlayerScreen';

function Listen() {

    const [searchValue, setSearchValue] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleButtonClick = () => {
        if (searchValue) {
            setSearchValue('');
        }
    };

    return (
        <PlayerScreen>
            <Row>
                <Col md={5} className="mx-auto">
                    <InputGroup>
                        <FormControl
                            type="search"
                            value={searchValue}
                            onChange={handleInputChange}
                            id="example-search-input"
                            className="border-end-0 border rounded-start-pill"
                            placeholder='Search'
                        />
                        <Button
                            variant="outline-secondary"
                            className="bg-white border-bottom-0 border rounded-end-pill ms-n5"
                            type="button"
                            onClick={handleButtonClick}
                        >
                            {searchValue ? <FaTimes /> : <FaSearch />}
                        </Button>
                    </InputGroup>
                </Col>
            </Row>
            <AudioList searchString={searchValue} />
        </PlayerScreen>
    );
}

export default Listen;

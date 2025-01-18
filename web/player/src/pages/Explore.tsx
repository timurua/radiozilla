import React, { useState } from 'react';
import { Button, Col, FormControl, InputGroup, Row } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { AudioList } from '../components/AudioList';
import PlayerScreen from '../components/PlayerScreen';
import { audioRetrivalState } from "../state/audio";
import { useRecoilValue, useSetRecoilState } from "recoil";


function Listen() {

    const [searchValue, setSearchValue] = useState('');
    const playableRetrieval = useRecoilValue(audioRetrivalState);
    const setPlayableSorting = useSetRecoilState(audioRetrivalState);    

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleDeleteButtonClick = () => {
        if (searchValue) {
            setSearchValue('');
        }
    };

    const handleSearchButtonClick = () => {
        if (searchValue) {
            setPlayableSorting({
                searchString: searchValue,
                sorting: null
            });            
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
                        { 
                            searchValue ? 
                            <Button
                                variant="outline-secondary"
                                className="bg-white border-0"
                                type="button"
                                onClick={handleDeleteButtonClick}
                            >
                                <FaTimes className="mr-20" />
                            </Button> 
                            : null
                        }                        
                        <Button
                            variant="outline-secondary"
                            className="bg-white border-0 rounded-end-pill ms-n5"
                            type="button"
                            onClick={handleSearchButtonClick}
                        >
                            {<FaSearch />}
                        </Button>
                    </InputGroup>
                </Col>
            </Row>
            <div className='mt-5'>
                <AudioList/>
            </div>
        </PlayerScreen>
    );
}

export default Listen;

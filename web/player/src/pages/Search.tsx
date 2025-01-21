import React, { useState } from 'react';
import { Button, Col, FormControl, InputGroup, Row } from 'react-bootstrap';
import { FaSearch} from 'react-icons/fa';
import { AudioList } from '../components/AudioList';
import PlayerScreen from '../components/PlayerScreen';
import { audioRetrivalState } from "../state/audio";
import { useSetRecoilState } from "recoil";


function Search() {

    const [searchValue, setSearchValue] = useState('');
    const setPlayableSorting = useSetRecoilState(audioRetrivalState);    

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
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
                <AudioList/>
            </div>
        </PlayerScreen>
    );
}

export default Search;

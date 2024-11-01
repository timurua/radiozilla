import React, { useState } from 'react';
import { Button, Col, FormControl, InputGroup, Row } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import BottomNavbar from '../components/BottomNavbar';
import { AudioList } from '../components/AudioList';
import TopNavbar from '../components/TopNavbar';

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
        <div className="min-vh-100">
            {/* Header */}
            <div>
                <TopNavbar />
            </div>

            <Row>
                <Col md={5} className="mx-auto">
                    <div className="small fw-light">search input with icon</div>
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

            <BottomNavbar />

        </div>
    );
}

export default Listen;

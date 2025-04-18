import React, { useEffect, useState } from 'react';
import { Container, Pagination } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import { FAWebPage, FAWebPageChannel } from '../../api';
import Client from '../../client';
import Spinner from '../Spinner';

interface DetailsProps {
    channel: FAWebPageChannel;
}

const Contents: React.FC<DetailsProps> = ({ channel }) => {
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState<Array<FAWebPage>>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        const fetchPages = async () => {
            setLoading(true);
            const response = await Client.getWebPagesByChannelIdApiV1GetWebPagesByChannelIdGet(channel.normalized_url_hash);
            if (response.data) {
                setPages(response.data);
            }
            setLoading(false);
        };
        fetchPages();
    }, [channel]);

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = pages.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

    // Calculate total pages
    const totalPages = Math.ceil(pages.length / itemsPerPage);

    // Generate pagination items
    const paginationItems = [];
    for (let number = 1; number <= totalPages; number++) {
        paginationItems.push(
            <Pagination.Item
                key={number}
                active={number === currentPage}
                onClick={() => handlePageChange(number)}
            >
                {number}
            </Pagination.Item>
        );
    }

    return (
        loading ? (
            <Spinner text='Loading pages...' />
        ) : pages.length === 0 ? (
            <div className="mt-5">
                <h3>Pages not found</h3>
            </div>
        ) : (
            <Container className="mt-5">
                <ListGroup>
                    {currentItems.map((page, index) => (
                        <ListGroup.Item key={index}>
                            {page.url}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                {totalPages > 1 && (
                    <Pagination className="mt-3 justify-content-center">
                        <Pagination.Prev
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        />
                        {paginationItems}
                        <Pagination.Next
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        />
                    </Pagination>
                )}
            </Container>
        )
    );
};

export default Contents;
import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch data from the Flask API using axios
        axios.get("/api/data")
            .then((response) => {
                setData(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Data from Flask API</h1>
            {data ? (
                <div>
                    <p><strong>Message:</strong> {data.message}</p>
                    <p><strong>Environment:</strong> {data.environment}</p>
                </div>
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
}

export default App;

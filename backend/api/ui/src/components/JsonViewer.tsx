import React from 'react';

interface JsonViewerProps {
    data: JsonValue;
}

type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
type JsonArray = JsonValue[];
interface JsonObject {
    [key: string]: JsonValue;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
    const formatValue = (value: JsonValue): JSX.Element => {
        if (typeof value === 'string') return <span className="text-success">"{value}"</span>;
        if (typeof value === 'number') return <span className="text-primary">{value}</span>;
        if (typeof value === 'boolean') return <span className="text-info">{String(value)}</span>;
        if (value === null) return <span className="text-danger">null</span>;
        return <>{value}</>;
    };

    const renderJson = (obj: JsonValue, level = 0): JSX.Element => {
        const indent = '  '.repeat(level);

        if (Array.isArray(obj)) {
            return (
                <span>
                    [
                    <div className="ps-4">
                        {obj.map((item, index) => (
                            <div key={index}>
                                {indent}{renderJson(item, level + 1)}
                                {index < obj.length - 1 && ','}
                            </div>
                        ))}
                    </div>
                    {indent}]
                </span>
            );
        }

        if (typeof obj === 'object' && obj !== null) {
            return (
                <span>
                    {'{'}
                    <div className="ps-4">
                        {Object.entries(obj).map(([key, value], index, arr) => (
                            <div key={key}>
                                {indent}<span className="text-warning">"{key}"</span>: {renderJson(value, level + 1)}
                                {index < arr.length - 1 && ','}
                            </div>
                        ))}
                    </div>
                    {indent}{'}'}
                </span>
            );
        }

        return formatValue(obj);
    };

    return (
        <pre className="bg-light p-3 rounded border overflow-auto">
            {renderJson(data)}
        </pre>
    );
};

export default JsonViewer;
import React, { useState } from 'react';

interface JsonViewerProps {
    data: JsonValue;
}

type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
type JsonArray = JsonValue[];
interface JsonObject {
    [key: string]: JsonValue;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const toggleCollapse = (path: string) => {
        const newCollapsed = new Set(collapsed);
        if (newCollapsed.has(path)) {
            newCollapsed.delete(path);
        } else {
            newCollapsed.add(path);
        }
        setCollapsed(newCollapsed);
    };

    const formatValue = (value: JsonValue): JSX.Element => {
        if (typeof value === 'string') return <span className="text-success">"{value}"</span>;
        if (typeof value === 'number') return <span className="text-primary">{value}</span>;
        if (typeof value === 'boolean') return <span className="text-info">{String(value)}</span>;
        if (value === null) return <span className="text-danger">null</span>;
        return <>{value}</>;
    };

    const renderJson = (obj: JsonValue, level = 0, path = ''): JSX.Element => {
        const indent = '  '.repeat(level);
        const isCollapsed = collapsed.has(path);

        if (Array.isArray(obj)) {
            const toggleButton = (
                <span 
                    className="me-2 cursor-pointer user-select-none"
                    onClick={() => toggleCollapse(path)}
                >
                    {isCollapsed ? '▶' : '▼'}
                </span>
            );

            return (
                <span>
                    {toggleButton}[
                    {isCollapsed ? (
                        <span className="text-muted"> ... </span>
                    ) : (
                        <div className="ps-4">
                            {obj.map((item, index) => (
                                <div key={index}>
                                    {indent}
                                    {renderJson(item, level + 1, `${path}[${index}]`)}
                                    {index < obj.length - 1 && ','}
                                </div>
                            ))}
                        </div>
                    )}
                    {!isCollapsed && indent}]
                </span>
            );
        }

        if (typeof obj === 'object' && obj !== null) {
            const toggleButton = (
                <span 
                    className="me-2 cursor-pointer user-select-none"
                    onClick={() => toggleCollapse(path)}
                >
                    {isCollapsed ? '▶' : '▼'}
                </span>
            );

            return (
                <span>
                    {toggleButton}{'{'}
                    {isCollapsed ? (
                        <span className="text-muted"> ... </span>
                    ) : (
                        <div className="ps-4">
                            {Object.entries(obj).map(([key, value], index, arr) => (
                                <div key={key}>
                                    {indent}
                                    <span className="text-warning">"{key}"</span>: 
                                    {renderJson(value, level + 1, `${path}.${key}`)}
                                    {index < arr.length - 1 && ','}
                                </div>
                            ))}
                        </div>
                    )}
                    {!isCollapsed && indent}{'}'}
                </span>
            );
        }

        return formatValue(obj);
    };

    return (
        <pre className="bg-light p-3 rounded border overflow-auto" style={{ cursor: 'default' }}>
            {renderJson(data)}
        </pre>
    );
};

export default JsonViewer;
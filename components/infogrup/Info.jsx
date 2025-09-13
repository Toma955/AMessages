import React from 'react';
import './Info.css';

const Info = ({ title = 'Info', children }) => {
    return (
        <div className="info-component">
            <h2 className="info-title">{title}</h2>
            <div className="info-content">{children}</div>
        </div>
    );
};

export default Info; 
import React, { FC, useState, useEffect } from 'react';
import ReactDom from 'react-dom';

import './index.css';


const HelloWorld: FC = () => {
    return (
        <div>
            hello HelloWorld
        </div>
    );
};

window.addEventListener('load', () => {
    const node = (document as any).getElementById('root');
    console.log(node);
    ReactDom.render(<HelloWorld />, node);
});

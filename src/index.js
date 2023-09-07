/* eslint-disable no-extend-native */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom'

Object.dict = (obj) => {
    return Object.entries(obj).map(e => { return { key: e[0], value: e[1] }; });
};

Object.enum = (obj) => {
    return Object.entries(obj).map(e => { return { label: e[0], value: e[1] }; });
};

Array.prototype.avg = function (mapFunc) {
    return this.map(mapFunc).reduce((a, b) => a + b, 0) / this.length;
}

Array.prototype.count = function (filter) {
    return this.filter(filter).length;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter basename='/ReactMPS'>
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

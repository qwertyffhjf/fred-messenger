import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  React.createElement('div', {
    style: {display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', fontFamily:'sans-serif'}
  }, React.createElement('h1', null, 'LGMU Messenger — Coming Soon'))
);

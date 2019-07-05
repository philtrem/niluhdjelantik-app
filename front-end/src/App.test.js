import React from 'react';
import ReactDOM from 'react-dom';
import AdminApp from './components/AdminApp/AdminApp';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AdminApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});

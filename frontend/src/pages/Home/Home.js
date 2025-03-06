import React from 'react';
import './Home.css'
import CIcon from '@coreui/icons-react';
import * as icon from '@coreui/icons';

const Home = () => {
  return (
    <div>
        <h2>Home</h2>
        <CIcon icon={icon.cibLeetcode} className='leetcode-icon-class'/>
    </div>
  );
};

export default Home;
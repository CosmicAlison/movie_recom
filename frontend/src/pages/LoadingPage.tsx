import React from 'react';
import '../styles/LoadingPage.css';

const LoadingPage: React.FC = () => {
    return(
        <div className='loader'>
            <span className='spinner'></span>
        </div>
    )
}

export default LoadingPage
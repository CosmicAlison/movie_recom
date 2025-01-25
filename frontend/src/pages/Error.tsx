import React from 'react';
import '../styles/Error.css';
const error = require('../assets/error.jpg');

const Error: React.FC = () => {
    return(
        <div className='error-div'>
            <img className='error-img' src={error} alt='Error Image'></img>
            <p>Oops! There was an error getting recommendations</p>
        </div>
    )
}

export default Error
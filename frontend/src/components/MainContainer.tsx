import React from 'react';
import '../styles/MainContainer.css'

interface MainContainerProps {
  children: React.ReactNode; 
}

const MainContainer: React.FC<MainContainerProps> = ({children}) => {
  return (
    <div className='main-container'>
      {children}
    </div>
  );
};

export default MainContainer;
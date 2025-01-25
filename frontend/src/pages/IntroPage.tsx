import React from 'react';
import '../styles/IntroPage.css'

interface onclickProps {
    onclickEvent: () => void;
}
const IntroPage: React.FC<onclickProps> = ({onclickEvent}) => {
  return (
    <div className="intro-container">
      <div className="intro-text-div">
        <h1>Welcome to <span className="intro-highlighted">PicFlix!</span></h1>
        <p>Stuck on what to watch? We'll help you find the perfect movie.</p>
      </div>
      <button className="start-button" onClick={onclickEvent}>Get Started</button>
    </div>
  );
};

export default IntroPage;

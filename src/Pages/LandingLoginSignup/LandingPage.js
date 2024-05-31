import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from 'react-bootstrap';

import './DynamicBackground.css'; 
import './SlidingAnimation-Landing.css'

export default function LandingPage() {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    setAnimate(true);
    setTimeout(() => navigate('/login'), 400); 
  };

  return (
    <div className={`app ${animate ? 'shift-left-bg' : ''}`}>
        <div className={`mainDiv ${animate ? 'shift-left' : ''}`} style = {{ position: 'relative', zIndex: 1, top: '30px' }}>

          <h1 style={{ fontSize: '1.5em', fontWeight: '550', letterSpacing: '2px' }}>
            Say Hello to Ben 
          </h1>

          <div style={{ height: '40px' }}></div>

          <div style={{ fontSize: '0.5em', fontWeight: '350', letterSpacing: '1px' }}>
            Introducing your new study assistant
          </div>

          <div style={{ height: '40px' }}></div>

          <Button variant="secondary" style={{ width: '180px', height: '60px', backgroundColor: '#333' }} onClick={handleClick}>
            Get Started
          </Button>
          
        </div>
    </div>
  );
}

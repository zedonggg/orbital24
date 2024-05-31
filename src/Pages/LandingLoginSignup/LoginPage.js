import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import LoadingModal from '../../Components/LoadingModal';
import './DynamicBackground-50%.css'; 
import './SlidingAnimation-Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = (e) => {
    setLoading(true);
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        navigate('/home');
        setLoading(false); // Move this line here
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        setLoading(false); // And here
      });
  }

  const handleClick = () => {
    setTimeout(() => navigate('/'), 400); 
  };

  return (
    <div className="login-page">
      <Row>
        <Col className="app50">
          <div className="mainDiv" style = {{ position: 'relative', zIndex: 1, top: '30px' }}>
            
            <h1 style={{ fontSize: '1.5em', fontWeight: '550', letterSpacing: '2px' }}>
                Say Hello to Ben 
            </h1>

            <div style={{ height: '40px' }}></div>

            <div style={{ fontSize: '0.5em', fontWeight: '350', letterSpacing: '1px' }}>
                Introducing your new study assistant
            </div>

            <div style={{ height: '40px' }}></div>

            <Button variant="secondary" style={{ width: '180px', height: '60px', backgroundColor: '#333'}} onClick={handleClick} >Get Started</Button>

          </div>
        </Col>
        <Col className="white-block">
          <Container className="d-flex align-items-center justify-content-center" style={{ position: "relative", zIndex: 1 }}>
            <div className="w-100" style={{ maxWidth: "400px" }}>
              <Card>
                <Card.Body>
                  <h2 className="text-center mb-4">Log In</h2>
                  <Form onSubmit={onLogin}>
                    <Form.Group id="email">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control type="email" required onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" />
                    </Form.Group>

                    <br />

                    <Form.Group id="password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control type="password" required onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
                    </Form.Group>

                    <br />

                    <Button className="w-100" type="submit" style = {{ backgroundColor: '#333'}}>Log In</Button>

                    <LoadingModal loading={loading} />

                  </Form>
                </Card.Body>
              </Card>

              <br />

              <div className="w-100 text-center mt-2">
              No account yet? <NavLink to="/signup"  style = {{color: '#333'}} >Sign Up</NavLink>
            </div>

            </div>
          </Container>
        </Col>
      </Row>
    </div>
  )
}

export default Login
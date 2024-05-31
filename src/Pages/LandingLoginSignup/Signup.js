import React, {useState} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {  createUserWithEmailAndPassword  } from 'firebase/auth';
import { auth } from '../../firebase';
import { Button, Row, Col, Card, Form, Container } from 'react-bootstrap';
import './DynamicBackground-50%.css';
import './SlidingAnimation-Login.css';
import LoadingModal from '../../Components/LoadingModal';


 
const Signup = () => {
    const navigate = useNavigate();
 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Add this line
 
    const onSubmit = async (e) => {
        e.preventDefault();
       
        setLoading(true);
       
        await createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
              // Signed in
              const user = userCredential.user;
              // ...
              console.log(user);
              navigate("/login")
          })
          .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(errorCode, errorMessage);
          })
          .finally(() => {
            setLoading(false);
          });
      }

    const handleClick = () => {
        setTimeout(() => navigate('/'), 400); 
    };
 
  return (
    <div className="login-page">
    <Row>
        <Col className="app50">
          <div className="mainDiv" style={{ position: 'relative', zIndex: 1, top: '30px' }}>

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
                <h1 className="text-center mb-4">Sign Up</h1>
                <Form onSubmit={onSubmit}>
                    <Form.Group id="email">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Email address"
                    />
                    </Form.Group>

                    <br />

                    <Form.Group id="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                    />
                    </Form.Group>

                    <br />

                    <Button type="submit" className="w-100" style = {{ backgroundColor: '#333'}} >
                    Sign up
                    </Button>

                    <LoadingModal loading={loading} />

                </Form>
                </Card.Body>
            </Card>

                <br />

                <div className="w-100 text-center mt-2">
                    Already have an account?{' '}
                    <NavLink to="/login" style = {{color: '#333'}}>
                    Sign in
                    </NavLink>
                </div>
            </div>
        </Container>
            </Col>
    </Row>
    </div>
  )
}
 
export default Signup
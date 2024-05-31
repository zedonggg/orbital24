import {React} from 'react';
import { Navbar, Nav, Container, Row, Col } from 'react-bootstrap';

import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

const HomePage = () => {

    const navigate = useNavigate();
 
    const handleLogout = () => {               
        signOut(auth).then(() => {
            navigate("/");
            console.log("Signed out successfully")
        }).catch((error) => {
        });
    }

    return (
      <>
        <Container fluid className='container-fluid' style={{ height: '100%', minHeight: '100vh' }}>
          <Row>
            <Col md={2} className='sidebar'>
            <Nav defaultActiveKey="/home" className="flex-column">
            <Nav.Link href="/home">Active</Nav.Link>
            <Nav.Link eventKey="link-1">Link</Nav.Link>
            <Nav.Link eventKey="link-2">Link</Nav.Link>
            <Nav.Link eventKey="disabled" disabled>
              Disabled
            </Nav.Link>
          </Nav></Col>

          <Col md='auto'>
            <p1>lsjdflkdsjflkdsjflkdsjflkdsjflkdsjflksdjfldkjsflksdjfldsjfldsjflj
              lsdjfksjflksdjfljsdfkjdsflsdfjlsdffws
            </p1>
          </Col>
          </Row>
        </Container>
      </>
        // <div>
        //   <Navbar bg="light" expand="lg">
        //     <Container>
        //       <Navbar.Brand href="#home">My Website</Navbar.Brand>
        //       <Navbar.Toggle aria-controls="basic-navbar-nav" />
        //       <Navbar.Collapse id="basic-navbar-nav">
        //         <Nav className="me-auto">
        //           <Nav.Link to="/home">Home</Nav.Link>
        //           <Nav.Link to="/about">About</Nav.Link>
        //           <Nav.Link to="/contact">Contact</Nav.Link>
        //         </Nav>

        //         <Navbar.Text>
        //             <button onClick={handleLogout}>Sign Out</button>
        //         </Navbar.Text>

        //       </Navbar.Collapse>
        //     </Container>
        //   </Navbar>
        // </div>
      );

};

export default HomePage;
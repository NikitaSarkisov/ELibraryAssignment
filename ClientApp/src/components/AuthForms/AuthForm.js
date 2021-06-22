import React, { Component } from 'react';
import { Container, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom';
import { Login } from './Login';
import { Register } from './Register';
import '../Form.css';


export class AuthFormComponent extends Component {
  constructor(props) {
    super(props);
    let activeTab = '1';
    if (props.location.pathname === '/register') {
      activeTab = '2';
    }

    this.state = { activeTab: activeTab };
    this.toggleTab = this.toggleTab.bind(this);
  }

  toggleTab(event) {
    const target = event.target;
    if (target.name === 'loginTab') {
      this.setState({ activeTab: '1' });
    }
    else if (target.name === 'registerTab') {
      this.setState({ activeTab: "2" });
    }
  }

  render() {
    return (
      <Container className="Form p-2">
        <Nav tabs fill pills>
          <NavItem >
            <NavLink name="loginTab" className={classnames({ active: this.state.activeTab === "1" })} onClick={this.toggleTab}>
              Login
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink name="registerTab" className={classnames({ active: this.state.activeTab === "2" })} onClick={this.toggleTab}>
              Register
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={this.state.activeTab}  >
          <TabPane tabId="1">
            <Row>
              <Col>
                <Login />
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Col>
                <Register />
              </Col>
            </Row>
          </TabPane>
        </TabContent>

      </Container>
    );
  }
}

export const AuthForm = withRouter(AuthFormComponent);
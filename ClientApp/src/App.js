import React, { Component } from 'react';
import { Redirect, Route, Switch, Link } from 'react-router-dom';
import { Navbar, NavItem, NavLink, Nav, Container } from 'reactstrap';
import { BookList } from './components/Book/BookList';
import { BookForm } from './components/Book/BookForm';
import { AuthForm } from './components/AuthForms/AuthForm';


export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
      <div>
        <header>
          <Navbar color="light" expand="md">
            <Nav className="mr-auto" navbar>
              <NavItem>
                <NavLink tag={Link} to="/books"> <h4>Library</h4></NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/my"><h4>My books</h4></NavLink>
              </NavItem>
            </Nav>
          </Navbar>
        </header>
        <Switch>
          <Route exact path="/"> <Redirect to="/books"/></Route>
          <Route exact path={['/login', '/register']} component={AuthForm} />

          <Route exact path="/books" render={(props) => <BookList key={Date.now()} private={false} />} />
          <Route exact path="/my" render={(props) => <BookList key={Date.now()} private={true} />} />

          <Route exact path={['/edit', '/add']} component={BookForm} />

          <Route>
            <Container>
              <h2>404 Not found</h2>
            </Container>
          </Route>
        </Switch>
      </div>
    );
  }
}

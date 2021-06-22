import React, { Component } from 'react';
import { List, ListGroupItem, Button, Container } from 'reactstrap';
import { Redirect, withRouter } from 'react-router-dom';
import { Book } from './Book';
import { ApiController } from '../Api/ApiController';

class BookListComponent extends Component {
  constructor(props) {
    super(props);
    console.log("Showing private books: ", props.private);
    this.state = { books: [], loading: true, redirectToLogin: false };
    this.redirectToForm = this.redirectToForm.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  redirectToForm() {
    this.props.history.push('/add');
  }

  async load() {
    let my = false;
    if (this.props.location.pathname === '/my') {
      my = true;
    }

    let result = await ApiController.fetchBooks(my);
    if (result.ok) {
      this.setState({ books: result.data, loading: false, redirectToLogin: false });
    }
    else {
      this.setState({ books: [], loading: false, redirectToLogin: true });
    }
  }

  render() {
    if (this.state.loading) {
      console.log("Loading book list");
      return (<Container><h2 className="m-2">Loading...</h2></Container>);
    }

    if (this.state.redirectToLogin) {
      console.log("Redirecting to /login");
      return (<Redirect to="/login"></Redirect>);
    }

    if (this.props.private) {

    }

    let bookListGroup = null;
    let books = [];

    for (let i = 0; i < this.state.books.length; i++) {
      books.push(<ListGroupItem key={i}><Book value={this.state.books[i]} private={this.props.private} /></ListGroupItem>);
    }
    if (books.length > 0) {
      bookListGroup = (<List className="m-2">
        {books}
      </List>);
    }
    else {
      bookListGroup = (<Container ><h2 className="m-2">No books to show</h2></Container>);
    }

    let addbutton = null;
    if (this.props.private) {
      addbutton = (<Button size="lg" color="primary" outline className="m-4" onClick={this.redirectToForm} >Add book</Button>);
    }
    return (
      <div>
        {addbutton}
        {bookListGroup}
      </div>
    );
  }
}
export const BookList = withRouter(BookListComponent);
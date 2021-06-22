import React, { Component } from 'react';
import { Card, CardBody, CardSubtitle, CardHeader, Button, Badge } from 'reactstrap';
import { withRouter } from "react-router-dom";
import { ApiController } from '../Api/ApiController';


// Book:
//   id
//   title
//   author
//   tags

export class BookComponent extends Component {
  constructor(props) {
    super(props);
    this.download = this.download.bind(this);
    this.delete = this.delete.bind(this);
    this.edit = this.edit.bind(this);
  }

  async download() {
    let result = await ApiController.downloadBook(this.props.value.id, this.props.value.title);
    if (!result) {
      alert('Could not download '  + this.props.title);
    }
  }

  async delete() {
    let result = await ApiController.deleteBook(this.props.value.id);
    if (result.ok){
      alert(this.props.title + ' deleted!');
    }
    else{
      alert('Could not delete ' + this.props.title);
    }
    
    window.location.reload();
  }

  edit() {
    let p = {
      pathname: "/edit",
      state: { value: this.props.value }
    };
    this.props.history.push(p);
  }

  render() {
    let tags = [];
    for (let i = 0; i < this.props.value.tags.length; i++) {
      tags.push(<Badge key={i} color="primary" className="mr-1" pill>{this.props.value.tags[i]}</Badge>)
    }

    let buttons;
    if (this.props.private) {
      buttons = [
        <Button className="mr-2" color="link" key={"del_button"} onClick={this.delete}>Delete</Button>,
        <Button className="mr-2" color="link" key={"edit_button"} onClick={this.edit}>Edit</Button>
      ]
    }
    else {
      buttons = [
        <Button className="mr-2" color="link" key={"download_button"} onClick={this.download}>Download</Button>
      ]
    }

    return (
      <Card>
        <CardHeader tag="h4">{this.props.value.title}</CardHeader>
        <CardBody>
          <CardSubtitle tag="h5" className="mb-2">{this.props.value.author}</CardSubtitle>
          <div className="mb-2">
            Tags: {tags}
          </div>
          <div>
            {buttons}
          </div>
        </CardBody>
      </Card>
    );
  }
}

export const Book = withRouter(BookComponent);
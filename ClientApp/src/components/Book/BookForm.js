import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { ApiController } from '../Api/ApiController';
import '../Form.css';

export class BookFormComponent extends Component {
    constructor(props) {
        super(props);

        this.id = null;

        if (props.location.state !== undefined) {
            let v = props.location.state.value;
            this.id = props.location.state.value.id;
            this.state = { title: v.title, author: v.author, tags: v.tags.join(', '), private: v.private, file: null };
            console.log(props.location.state.value);
        }
        else {
            this.state = { title: '', author: '', tags: '', private: false, file: null };
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({ loading: true });


        let book = { title: this.state.title, author: this.state.author, tags: this.state.tags, private: this.state.private };
        let result = await ApiController.uploadBook(book, this.state.file, this.id);


        if (result.ok) {
            this.props.history.push('/my');
            alert(this.state.title + ' uploaded!');
            return;
        }
        else {
            alert('Upload error');
        }
    }

    handleInputChange(e) {
        switch (e.target.name) {
            case 'title':
                this.setState({ title: e.target.value });
                break;
            case 'author':
                this.setState({ author: e.target.value });
                break;
            case 'tags':
                this.setState({ tags: e.target.value });
                break;
            case 'private':
                this.setState({ private: e.target.checked });
                break;
            case 'file':
                this.setState({ file: e.target.files[0] });
                break;
            default:
                break;
        }
    }

    render() {
        return (
            <Container className="Form p-2">
                <Form onSubmit={this.handleSubmit} className="m-4" >
                    <h1>{this.id === null ? "Upload book" : "Update book"}</h1>
                    <FormGroup>
                        <Label for="titleInput">Title</Label>
                        <Input type="text" value={this.state.title} onChange={this.handleInputChange} name="title" id="titleInput" placeholder="Title" required />
                    </FormGroup>
                    <FormGroup>
                        <Label for="authorInput">Author</Label>
                        <Input type="text" value={this.state.author} onChange={this.handleInputChange} name="author" id="authorInput" placeholder="Author" required />
                    </FormGroup>
                    <FormGroup>
                        <Label for="tagsInput">Tags</Label>
                        <Input type="text" value={this.state.tags} onChange={this.handleInputChange} name="tags" id="tagsInput" placeholder="Tags" />
                    </FormGroup>
                    <FormGroup check>
                        <Label check>
                            <Input type="checkbox" checked={this.state.private} onChange={this.handleInputChange} name="private" id="privateInput" />
                            Private
                        </Label>
                    </FormGroup>
                    <FormGroup className="mt-2">
                        <Label for="fileInput">File</Label>
                        <Input type="file" name="file" id="fileInput" onChange={this.handleInputChange} required />
                    </FormGroup>
                    <Label hidden={!this.state.loading}>{this.id === null ? "Uploading" : "Updating"}</Label>
                    <Input type="submit" value={this.id === null ? "Upload" : "Update"} disabled={this.state.loading} />
                </Form>
            </Container>
        );
    }
}

export const BookForm = withRouter(BookFormComponent);
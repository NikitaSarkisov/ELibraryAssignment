import React from 'react';
import { withRouter } from "react-router-dom";
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { AuthController } from '../Api/AuthController';


class LoginComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '', password: '', loading: false };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async login() {
        this.setState({ loading: true });

        let result = await AuthController.Login(this.state.username, this.state.password);
        if (result !== null) {
            this.props.history.push('/');
            return;
        }
        else {
            alert('Login error');
        }

        this.setState({ loading: false });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.login();
    }

    handleInputChange(event) {
        const target = event.target;
        if (target.name === 'username') {
            this.setState({ username: target.value });
        }
        else if (target.name === 'password') {
            this.setState({ password: target.value });
        }
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit} className="m-4" >
                <FormGroup>
                    <Label for="usernameInput">Username</Label>
                    <Input type="text" value={this.state.username} onChange={this.handleInputChange} name="username" id="usernameInput" placeholder="Username" required />
                </FormGroup>
                <FormGroup>
                    <Label for="passwordInput">Password</Label>
                    <Input type="text" value={this.state.password} onChange={this.handleInputChange} name="password" id="passwordInput" placeholder="Password" required />
                </FormGroup>
                <Label hidden={!this.state.loading}>Logging...</Label>
                <Input type="submit" value="Login" disabled={this.state.loading} />
            </Form>
        );
    }
}

export const Login = withRouter(LoginComponent);
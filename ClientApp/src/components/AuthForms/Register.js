import React from 'react';
import { withRouter } from "react-router-dom";
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { AuthController } from '../Api/AuthController';


class RegisterComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '', password: '', passwordConfirm: '', loading: false };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async register() {
        this.setState({ loading: true });

        if (this.state.password !== this.state.passwordConfirm){
            alert("Passwords do not match!");
            this.setState({ loading: false });
            return
        }

        let result = await AuthController.Register(this.state.username, this.state.password);
        if (result !== null) {
            this.props.history.push('/');
            return;
        }
        else {
            alert('Register error');
        }

        this.setState({ loading: false });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.register();
    }

    handleInputChange(event) {
        const target = event.target;
        if (target.name === 'username') {
            this.setState({ username: event.target.value });
        }
        else if (target.name === 'password') {
            this.setState({ password: event.target.value });
        }
        else if (target.name === 'passwordConfirm') {
            this.setState({ passwordConfirm: event.target.value });
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
                <FormGroup>
                    <Label for="passwordConfirmInput">Password confirm</Label>
                    <Input type="text" value={this.state.passwordConfirm} onChange={this.handleInputChange} name="passwordConfirm" id="passwordConfirmInput" placeholder="Password confirm" required />
                </FormGroup>
                <Label hidden={!this.state.loading}>Registering...</Label>
                <Input type="submit" value="Register" disabled={this.state.loading} />
            </Form>
        );
    }
}

export const Register = withRouter(RegisterComponent);
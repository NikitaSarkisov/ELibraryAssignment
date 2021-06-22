const ApiUrl = '/api/user';

class Auth {
    getToken() {
        return localStorage.getItem('accessToken');
    }

    removeTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    saveTokens(body) {
        if (body === null) {
            return null;
        }
        let accessToken = body['accessToken'];
        let refreshToken = body['refreshToken'];

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        return accessToken;
    }

    async Login(username, password) {
        this.removeTokens();

        const body = JSON.stringify({ name: username, password: password });
        const init = {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: body
        };

        let result = await this._fetch(ApiUrl + '/login', init);
        return this.saveTokens(result);
    }

    async Register(username, password) {
        const body = JSON.stringify({ name: username, password: password });
        const init = {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: body
        };

        let result = await this._fetch(ApiUrl + '/register', init);
        return this.saveTokens(result);
    }

    async Refresh() {
        const token = localStorage.getItem('refreshToken');
        if (token === null) {
            return null;
        }

        const body = JSON.stringify({ refreshToken: token });
        const init = {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: body
        };

        let result = await this._fetch(ApiUrl + '/refresh', init);
        return this.saveTokens(result);
    }

    async _fetch(url, init) {
        return await fetch(url, init)
            .then(res => {
                console.log('AUTH: ', res);
                if (!res.ok) {
                    return null;
                }
                else {
                    return res.json();
                }
            });
    }
}

export const AuthController = new Auth();
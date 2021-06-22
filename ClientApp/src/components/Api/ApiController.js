import { AuthController } from "./AuthController";

const ApiUrl = '/api';
const NullResult = { ok: false, data: null };

class Api {
    // ###### Fetch Books ######

    async fetchBooks(my) {
        let token = AuthController.getToken();
        if (token === null) {
            console.log('API: No access token. Should redirect to /login');
            return NullResult;
        }

        let result = await this._fetchBooks(token, my);
        if (!result.ok) {
            token = await AuthController.Refresh();
            if (token === null) {
                console.log('API: Access token invalid. Refreshing tokens');
                return NullResult;
            }

            result = await this._fetchBooks(token, my);
            if (!result.ok) { return NullResult; }
        }
        return result;
    }

    async _fetchBooks(token, my) {
        let url = ApiUrl + (my ? '/book/listmy' : '/book/list');

        let header = { 'Authorization': 'Bearer ' + token };
        let result = await fetch(url, { headers: header })
            .then(async res => {
                console.log('API: Fetch books: ', res);
                if (!res.ok) {
                    return NullResult;
                }
                else {
                    let data = await res.json();
                    return { ok: true, data: data };
                }
            });

        return result;
    }

    // ###### Download Book ######

    async downloadBook(id, filename) {
        let token = AuthController.getToken();
        if (token === null) {
            console.log('API: No access token. Should redirect to /login');
            return NullResult;
        }

        let result = await this._downloadBook(token, id, filename);
        if (!result.ok) {
            console.log('API: Access token invalid. Refreshing tokens');
            token = await AuthController.Refresh();
            if (token === null) { return NullResult; }

            result = await this._downloadBook(token, id, filename);
            if (!result.ok) { return NullResult; }
        }
        return result;
    }

    async _downloadBook(token, id, filename) {
        let header = { 'Authorization': 'Bearer ' + token };
        let result = await fetch(ApiUrl + '/book/download/' + id, { headers: header })
            .then(async res => {
                console.log('API: Download: ', res);
                if (!res.ok) {
                    return NullResult;
                }
                else {

                    let data = await res.blob();
                    var a = document.createElement("a");
                    let fileurl = window.URL.createObjectURL(data);
                    a.href = fileurl;
                    a.download = filename;
                    a.click();
                    window.URL.revokeObjectURL(fileurl);
                    return { ok: true, data: null };
                }
            });
        return result;
    }

    // ###### Upload Book ######

    // Book:
    //   id
    //   title
    //   author
    //   tags
    async uploadBook(book, file, id) {
        let token = AuthController.getToken();
        if (token === null) {
            console.log('API: No access token. Should redirect to /login');
            return NullResult;
        }

        let result = await this._uploadBook(token, book, file, id);
        if (!result.ok) {
            console.log('API: Access token invalid. Refreshing tokens');
            token = await AuthController.Refresh();
            if (token === null) { return NullResult; }

            result = await this._uploadBook(token, book, file, id);
            if (!result.ok) { return NullResult; }
        }
        return result;
    }

    async _uploadBook(token, book, file, id) {
        let bookJson = JSON.stringify(book);
        let formdata = new FormData();
        formdata.append('book_info', bookJson);
        formdata.append('file', file);

        let url = '';
        let method = '';
        if (id !== null) {
            url = ApiUrl + '/book/update/' + id;
            method = 'PUT';
        }
        else {
            url = ApiUrl + '/book/create';
            method = 'POST';
        }

        let header = {
            'Authorization': 'Bearer ' + token
        };
        const init = {
            method: method,
            mode: 'cors',
            headers: header,
            body: formdata
        };

        console.log(bookJson);

        let result = await fetch(url, init)
            .then(async res => {
                console.log('API: Upload: ', res);
                if (!res.ok) {
                    return NullResult;
                }
                else {
                    return { ok: true, data: null };
                }
            });
        return result;
    }


    // ###### Delete Book ######
    async deleteBook(id) {
        let token = AuthController.getToken();
        if (token === null) {
            console.log('API: No access token. Should redirect to /login');
            return NullResult;
        }

        let result = await this._deleteBook(token, id);
        if (!result.ok) {
            console.log('API: Access token invalid. Refreshing tokens');
            token = await AuthController.Refresh();
            if (token === null) { return NullResult; }

            result = await this._deleteBook(token, id);
            if (!result.ok) { return NullResult; }
        }
        return result;
    }

    async _deleteBook(token, id) {
        let url = ApiUrl + '/book/delete/' + id;
        let header = { 'Authorization': 'Bearer ' + token };
        let result = await fetch(url, { method: 'DELETE', headers: header })
            .then(async res => {
                console.log('API: Delete: ', res);
                if (!res.ok) {
                    return NullResult;
                }
                else {
                    return { ok: true, data: null };
                }
            });
        return result;
    }
}

export const ApiController = new Api();
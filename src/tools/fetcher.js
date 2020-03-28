import { EventEmitter } from './eventEmitter';
import { parse } from 'url';
import { RequestError } from './errors';

/**
 * Wrapper for fetch
 */
export class Fetch extends EventEmitter {
    constructor(token, endpoint) {
        super();
        this.token = token;
        this.endpoint = endpoint;
    }

    initialize(endpoint) {
        this.endpoint = endpoint;
    }

    setToken(token) {
        this.token = token;
    }

    request(path, options) {
        if (options === undefined) {
            if (typeof path === 'string') {
                options = {};
            } else {
                // request({ path, .. }) => request(path, { .. })
                options = path;
                path = options.path;
            }
        }

        const { endpoint = this.endpoint, method = 'GET', query = {}, headers = {}, auth = true, body } = options;

        if (Object.keys(query).length) {
            const querystring = Object.entries(query)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            path = path.indexOf('?') > -1 ? `${path}&${querystring}` : `${path}?${querystring}`;
        }

        // prefix the path with the endpoint unless we have an absolute URL
        let url = parse(path).host ? path : `${endpoint}${path}`;

        let data = options.data;
        if (data && !(data instanceof window.FormData) && !body) {
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json; charset=utf-8';
            }

            if (data && data instanceof Object) {
                data = JSON.stringify(data);
            }
        }

        if (this.token && auth && !('Authorization' in headers)) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        if (!('Accept' in headers)) {
            headers['Accept'] = 'application/json';
        }

        return fetch(url, {
            method,
            body: body || data,
            headers
        }).then(response => {
            // XXX: we could handle 300 responses now on the same endpoint
            if (response.status < 200 || response.status > 299) {
                return response.text().then(text => {
                    // Emit error event to be caught somewhere
                    this.emit(response.status.toString(), { response, text });

                    throw new RequestError('[Fetch] Error requesting resource', url, response.status, text);
                });
            }

            const contentType = response.headers.get('Content-type') || '';
            if (contentType.indexOf('application/json') !== 0) {
                return response;
            }
            return response.json().then(json => ({
                ok: true,
                json: async () => json,
                response: json,
                headers: response.headers,
                status: response.status
            }));
        });
    }

    get(path, options) {
        return this.request(path, {
            ...options,
            method: 'GET'
        });
    }

    post(path, options) {
        return this.request(path, {
            ...options,
            method: 'POST'
        });
    }

    put(path, options) {
        return this.request(path, {
            ...options,
            method: 'PUT'
        });
    }

    patch(path, options) {
        return this.request(path, {
            ...options,
            method: 'PATCH'
        });
    }

    delete(path, options) {
        return this.request(path, {
            ...options,
            method: 'DELETE'
        });
    }
}

export const fetcher = new Fetch();

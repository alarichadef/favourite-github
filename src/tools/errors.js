export class MustBeOverridenError extends Error {}

export class ArgumentError extends Error {}

/**
 * Extends error to be able to keep external data
 */
export class RequestError extends Error {
    constructor(message, url, code, response) {
        super(message);
        this.message = message;
        this.url = url;
        this.code = code;
        this.response = response;
        this.name = this.constructor.name;
    }

    toString() {
        return `[Fetch] Could not fetch ${this.url} (${this.code}):\n${this.response}\n${this.stack}`;
    }
}

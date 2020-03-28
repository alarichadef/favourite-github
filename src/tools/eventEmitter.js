/**
 * Small implementation of an event emitter
 */
export class EventEmitter {
    constructor() {
        this.__events = {};
    }

    /**
     * Register new events
     */
    on(event, callback) {
        if (!this.__events[event]) {
            this.__events[event] = [callback];
            return;
        }

        if (this.__events[event].findIndex(callback) > -1) {
            // possible memory leak
            return;
        }

        this.__events[event].push(callback);
    }

    /**
     * Emit events
     */
    emit(event, data) {
        if (!this.__events[event]) {
            // We do not warn the user because this is primarily used
            // in the fetcher implementation, warning for every 4xx and 3xx response
            return;
        }

        for (let callback of this.__events[event]) {
            callback(data);
        }
    }
}

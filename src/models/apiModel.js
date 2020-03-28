import { fetcher } from '../tools/fetcher';
import ModelProxy from '../tools/modelProxy';
import { ArgumentError, MustBeOverridenError } from '../tools/errors';

import QueryString from 'querystring';

export class BaseAPIModel {
    constructor(fromAPI) {
        if (fromAPI instanceof this.constructor) {
            return fromAPI;
        }
        this.__update = {};
        this.object = fromAPI || {};
        return new Proxy(this, ModelProxy);
    }

    /**
     * Create model list from api return
     */
    static list(apiList) {
        console.warn('apiList =>', apiList);
        return apiList.map(item => this.fromJSON(item));
    }

    /**
     * Create single item from api return
     */
    static fromJSON(item) {
        return new this(item);
    }

    /**
     * Gets the url for this object(s)
     */
    static listUrl() {
        throw new MustBeOverridenError('Model#listUrl must be overriden by each object');
    }

    static getQueryString(query = null) {
        if (!query || !Object.keys(query).length) {
            return '';
        }
        if (typeof query === 'string') {
            return `?${query}`;
        }
        let querystring = QueryString.stringify(query);
        return `?${querystring}`;
    }

    /**
     * Creates a query string to append to each url
     */
    static getListUrl(params = {}, query = false) {
        let url = this.listUrl(params);
        console.warn('query =>', query, params)
        let queryString = this.getQueryString(query);
        return url + queryString;
    }

    /**
     * Gets the url for this object(s)
     */
    static getItemUrl(...args) {
        let params = args[0];
        if (!params.id) {
            throw new ArgumentError(`[Model][${this.constructor.name}] id is mandatory`);
        }

        let query = args[1];
        let queryString = this.getQueryString(query);

        return `${this.getListUrl(args[0])}/${params.id}${queryString}`;
    }

    /**
     * Get all items from api
     */
    static getAll(...args) {
        let url = this.getListUrl(...args);

        // Must be caught later
        return this.fetcher.get(url).then(({ response, headers, status }) => {
            let list = this.list(response);
            list.__meta = { headers, status, response };
            return list;
        });
    }

    /**
     * alias for @getAll
     */
    static filter(...args) {
        return this.getAll(...args);
    }

    /**
     * Get a single item from api
     */
    static get(...args) {
        let url = this.getItemUrl(...args);

        // Must be caught later
        return this.fetcher.get(url).then(({ response, headers, status }) => {
            let ret = this.fromJSON(response);
            ret.__meta = { headers, status, response };
            return ret;
        });
    }

    /**
     * Gets the fields (and various settings on them for this object)
     */
    fields() {
        throw new MustBeOverridenError('Model#fields() must be overriden by each object');
    }

    /**
     * Auto resolve the PK from fields description
     */
    _get_pk() {
        let fields = this.fields();
        let primaryKeys = Object.keys(fields).filter(key => fields[key].primaryKey);
        if (primaryKeys.length > 1) {
            throw new Error(`[Model][${this.constructor.name}] has more than one primaryKey`);
        }
        if (primaryKeys.length === 0) {
            throw new Error(`[Model][${this.constructor.name}] has no primaryKey`);
        }
        return primaryKeys[0];
    }

    /**
     * Get PK of model
     */
    get pk() {
        let pk = this._get_pk();
        return this.object[pk];
    }

    /**
     * Set PK of model resolving automatically
     */
    set pk(value) {
        if (this.pk) {
            throw new Error(`[${this.constructor.name}] Cannot change primary key`);
        }

        let pk = this._get_pk();
        this.object[pk] = value;
    }

    /**
     * check if a field is writable for API output
     */
    _is_writable_field(key) {
        // Ignore object property
        if (['object', '__update', '__meta'].includes(key)) {
            return false;
        }

        let fields = this.fields();

        let field = fields[key];

        // Ignore properties not set
        if (!field) {
            return true;
        }

        if ('readOnly' in field && field.readOnly) {
            return false;
        }

        return true;
    }

    /**
     * check if a field is primary key for API output
     */
    _is_primary_key_field(key) {
        // Ignore object property
        if (key === 'object') {
            return false;
        }
        const fields = this.fields();

        const field = fields[key];

        // Ignore properties not set
        if (!field) {
            return false;
        }

        if ('primaryKey' in field && field.primaryKey) {
            return true;
        }

        return false;
    }

    /**
     * Format object for API
     */
    toAPI() {
        let content = Object.keys(this.object)
            .filter(key => this._is_writable_field(key) || this._is_primary_key_field(key))
            .reduce((res, key) => {
                res[key] = this.object[key];
                return res;
            }, {});
        return content;
    }

    // Shadow object methods:
    // Their objective is to allow partial modification of an object without
    // committing to the changes, allowing for data flow to be as streamlined
    // as possible and only committing when ready.
    /**
     * Display a copy of object on order to do not propagate changes in real object
     * @returns {{}}
     */
    copy() {
        return new this.constructor(this.object);
    }

    /**
     * Updates an object without committing
     */
    update(key, value) {
        this.__update[key] = value;
        return this;
    }

    /**
     * Gets a value from the object. Special method to juggle between __update and object
     */
    get(prop) {
        if (!prop) {
            return undefined;
        }

        return this.__update[prop] || this[prop];
    }

    /**
     * Commit updated changes
     */
    commit() {
        if (!Object.keys(this.__update).length) {
            // maybe warn ?
            return;
        }

        for (let k in this.__update) {
            this[k] = this.__update[k];
        }

        this.restore();
        return this;
    }

    /**
     * Restores shadow model to no values
     */
    restore() {
        this.__update = {};
    }

    /**
     * Save item to API
     */
    save(...args) {
        return this.constructor.save(this, ...args);
    }

    /**
     * Save objects of this class to API (multiple or one)
     */
    static save(objects, ...args) {
        if (!(objects instanceof Array)) {
            objects = [objects];
        }

        if (objects.some(object => !(object instanceof this))) {
            throw new Error(`[Model][${this.name}] Cannot save objects from other models`);
        }

        let singleObject = objects.length === 1;

        // Set PK value to enter in url later with getItemURL
        if (singleObject && objects[0].pk) {
            args[0].id = objects[0].pk;
        }

        let data = singleObject ? objects[0].toAPI() : objects.map(object => object.toAPI());
        let url = singleObject && objects[0].pk ? this.getItemUrl(...args) : this.getListUrl(...args);

        // No object has PK so we POST
        if (objects.every(object => !object.pk)) {
            return this.fetcher.post(url, { data });
        }

        // All objects have pk so we PATCH
        if (objects.every(object => object.pk)) {
            return this.fetcher.patch(url, { data });
        }

        throw new Error(`[Model][${this.name}] Please save _only_ new or _only_ modified objects`);
    }

    /**
     * Delete in API
     */
    delete(...args) {
        if (!this.pk) {
            throw Error('Cannot delete an object without pk');
        }
        return this.destroy(...args);
    }

    /**
     * Delete in API according pk or not
     * Protips : arg[0] = args for call
     *           arg[1] = query
     *           arg[2] = data to send in delete request
     */
    destroy(...args) {
        if (this.pk) {
            args[0].id = this.pk;
            let url = this.constructor.getItemUrl(...args);
            let params = {};

            // Sometimes we need to send data to DELETE route
            if (args[2]) {
                params.data = args[2];
            }

            return this.constructor.fetcher.delete(url, params);
        }

        // if no pk
        let url = this.constructor.getListUrl(args[0]);
        let data = {};
        if (args[2]) {
            data = args[2];
        }
        return this.constructor.fetcher.delete(url, { data });
    }

    static sort(array) {
        if (!array.length || array[0].display_order === undefined) {
            return array;
        }
        return array.sort((el1, el2) => el1.display_order - el2.display_order);
    }

}

BaseAPIModel.fetcher = fetcher;

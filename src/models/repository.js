import { BaseAPIModel } from './apiModel';

export default class Repository extends BaseAPIModel {
    fields() {
        return {
            name: {primaryKey: true, readOnly: true}
        };
    }

    // TODO: handle limit/offset rules
    static listUrl() {

        return `/github/repositories`;
    }

}

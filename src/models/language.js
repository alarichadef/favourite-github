import { BaseAPIModel } from './apiModel';

export default class Language extends BaseAPIModel {
    fields() {
        return {
            name: { primaryKey: true, readOnly: true }
        };
    }

    static list(apiList) {
        return apiList.map(item => this.fromJSON({name: item}));
    }


    // TODO: handle limit/offset rules
    static listUrl() {

        return `/github/languages`;
    }

}

import { BaseAPIModel } from './apiModel';

export default class SpokenLanguage extends BaseAPIModel {
    fields() {
        return {
            language: { primaryKey: true, readOnly: true },
        };
    }

    // TODO: handle limit/offset rules
    static listUrl() {

        return `/github/spoken-languages`;
    }

}

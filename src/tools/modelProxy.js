export default {
    get: (obj, prop) => {
        if (prop in obj) {
            return obj[prop];
        }

        if (obj.object && prop in obj.object) {
            return obj.object[prop];
        }
    },
    set: (obj, prop, val) => {
        // Some idiot thought __proto__ was a good idea
        if (prop === '__proto__') {
            return false;
        }

        // TODO: add readOnly protection from obj.fields()
        if (obj.object) {
            obj.object[prop] = val;
            return true;
        }

        if (prop in obj) {
            obj[prop] = val;
        }

        return true;
    },
    deleteProperty: (obj, prop) => {
        if (prop in obj) {
            delete obj[prop];
        }

        if (prop in obj.object) {
            delete obj.object[prop];
        }

        // Allow deleting anything
        return true;
    }
};

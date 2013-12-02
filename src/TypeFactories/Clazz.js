clazz('Clazz', 'Abstract', function(slef, clazz, injector) {
    return {
        methods: {
            getName: function() {
                return 'clazz'
            },
            getParamsDefinitions: function() {
                return {
                    name: {
                        type: ['string'],
                        required: true
                    },
                    parent: {
                        converters: {
                            stringOrClazz: function(value) {
                                if (_.isString(value)) {
                                    value = injector.get(value);
                                }
                                return value;
                            }
                        }
                    },
                    deps: {
                        type: ['array'],
                        default: [],
                        converters: {
                            resolve: function(value) {
                                if (_.isString(value)) {
                                    value = injector.get(value);
                                }
                                return value;
                            }
                        }
                    }
                }
            },
            createObject: function(params) {
                return clazz(params.name, params.parent, params.deps)
            }
        }
    }
});
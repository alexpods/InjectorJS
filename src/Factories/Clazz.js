clazz('Clazz', 'Abstract', function(slef, clazz) {
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
                        type: ['function']
                    },
                    deps: {
                        type: ['array'],
                        default: []
                    }
                }
            },
            createObject: function(params) {
                return clazz(params.name, params.parent, params.deps)
            }
        }
    }
});
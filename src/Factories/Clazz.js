clazz('Clazz', 'Abstract', function(slef) {
    return {
        properties: {
            clazz: {
                type: 'function',
                default: function() {
                    return ClazzJS.clazz;
                }
            }
        },
        methods: {
            getName: function() {
                return 'clazz'
            },
            getParamsDefinition: function() {
                return {
                    name: {
                        type: 'string'
                    },
                    parent: {
                        type: 'function'
                    },
                    deps: {
                        type: ['array'],
                        default: []
                    }
                }
            },
            createObject: function(params) {
                var clazz = this.getClazz();
                return clazz(params.name, params.parent, params.deps)
            }
        }
    }
});
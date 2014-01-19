/**
 * Clazz object factory
 * Create clazz based on 'name', 'parent' and 'deps' (dependencies) parameters
 *
 * @typedef {function} ClazzFactory
 * @class
 */
clazz('Clazz', 'Abstract', function(self) {
    return {
        properties: {

            /**
             * Clazz constructor
             * @var
             */
            clazz: {
                type: 'function',
                "default": function() {
                    return ClazzJS.clazz;
                }
            }
        },
        methods: {

            /**
             * Gets object factory name
             * @returns {string} Object factory name
             *
             * @this {ClazzFactory}
             */
            getName: function() {
                return 'clazz'
            },

            /**
             * Gets parameters definition for clazz creation
             *
             * @returns {object} Parameters definition
             *
             * @this {ClazzFactory}
             */
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

            /**
             * Creates clazz using specified processed parameters
             *
             * @param {object} params Parameters for clazz creation
             * @returns {*} Created clazz
             *
             * @this {ClazzFactory}
             */
            createObject: function(params) {
                var clazz = this.getClazz();
                return clazz(params.name, params.parent, params.deps)
            }
        }
    }
});
/**
 * Abstract object factory
 *
 * @typedef {function} AbstractFactory
 * @class
 */
clazz('Abstract', function(self) {
    return {
        properties: {

            /**
             * Parameter processor
             * Processed parameters before pass them to create method
             *
             * @see create()
             * @see processParams()
             *
             * @var {ParameterProcessor}
             */
            parameterProcessor: {
                type: ['object', { instanceOf: '/InjectorJS/ParameterProcessor' }],
                "default": function() {
                    return clazz('/InjectorJS/ParameterProcessor').create();
                }
            }
        },
        methods: {

            /**
             * Gets object factory name
             * Must be realized in child clazz
             *
             * @returns {string} Object factory name
             *
             * @this {AbstractFactory}
             */
            getName: function() {
                throw new Error('You must specify type name in child clazz!');
            },

            /**
             * Creates object using specified raw parameters
             *
             * @param {object} params Raw parameters for object creation
             * @returns {*} Created object
             *
             * @this {AbstractFactory}
             */
            create: function(params) {
                return this.createObject(this.processParams(params));
            },

            /**
             * Creates object using specified processed parameters
             * Must be realized in child clazz
             *
             * @param {object} params Parameters for object creation
             * @returns {*} Created object
             *
             * @this {AbstractFactory}
             */
            createObject: function(params) {
                throw new Error('You must realize "createObject" method in child clazz!');
            },

            /**
             * Gets definition of supported parameters for object creation
             *
             * @returns {object}
             *
             * @this {AbstractFactory}
             */
            getParamsDefinition: function() {
                return {};
            },

            /**
             * Process parameters for object creation
             *
             * @param {object} params Raw object parameters for object creation
             * @returns {object} Processed object parameters
             *
             * @this {AbstractFactory}
             */
            processParams: function(params) {

                var that = this;
                var paramsDefinition   = this.getParamsDefinition();
                var parameterProcessor = this.getParameterProcessor();

                _.each(params, function(value, param) {
                    if (!(param in paramsDefinition)) {
                        throw new Error('Parameter "' + param + '" does not defined!');
                    }
                    params[param] = parameterProcessor.process(value, paramsDefinition[param], param, that);
                });

                return params;
            }
        }
    };
});
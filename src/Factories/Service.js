/**
 * Service object factory
 * Instantiate object based on specified class and initialization parameters
 *
 * @typedef {function} ServiceFactory
 * @class
 */
clazz('Service', 'Abstract', function(self) {
    return {
        methods: {

            /**
             * Gets object factory name
             * @returns {string} Object factory name
             *
             * @this {ServiceFactory}
             */
            getName: function() {
                return 'service'
            },

            /**
             * Gets parameters definition for object instantiation creation
             *
             * @returns {object} Parameters definition
             *
             * @this {ClazzFactory}
             */
            getParamsDefinition: function() {
                return {
                    class: {
                        type: ['function']
                    },
                    init: {
                        type: ['array'],
                        default: []
                    },
                    call: {
                        type: ['hash', { element: 'array' }],
                        default: {}
                    }
                }
            },

            /**
             * Creates object using specified processed parameters
             *
             * @param {object} params Parameters for object creation
             * @returns {*} Created object
             *
             * @this {ServiceFactory}
             */
            createObject: function(params) {

                // Create '_createService' function for this purpose for parameters applying to clazz constructor.
                var service = this._createService(params.class, params.init);

                _.each(params.call, function(params, method) {
                    service[method].apply(service, params);
                });

                return service;
            },

            /**
             * Instantiate object of specified class
             * Needs to pass random length parameters (to use 'apply' method for class)
             *
             * @param {function} klass   Class
             * @param {object}   params  Initialization parameters
             * @returns {object} Instantiated object
             *
             * @this {ServiceFactory}
             * @private
             */
            _createService: function(klass, params) {
                var K = function() {
                    return klass.apply(this, params);
                };
                K.prototype = klass.prototype;

                return new K();
            }
        }
    };
});
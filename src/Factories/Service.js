clazz('Service', 'Abstract', function(self) {
    return {
        methods: {
            getName: function() {
                return 'service'
            },

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

            createObject: function(params) {

                // Create '_createService' function for this purpose for parameters applying to clazz constructor.
                var service = this._createService(params.class, params.init);

                _.each(params.call, function(params, method) {
                    service[method].apply(service, params);
                });

                return service;
            },

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
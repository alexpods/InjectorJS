clazz('Service', 'Abstract', function(self) {
    return {
        methods: {
            getName: function() {
                return 'service'
            },
            getParamsDefinitions: function() {
                return {
                    class: {
                        type: ['function'],
                        required: true
                    },
                    init: {
                        type: ['array'],
                        default: []
                    },
                    call: {
                        type: ['hash', { element: { type: 'array' }}],
                        default: {}
                    }
                }
            },
            createObject: function(params) {
                var service = construct(params.class, params.init);

                for (var method in params.call) {
                    service[service].apply(service, params.call[method]);
                }

                return service;

                function construct(klass, params) {
                    var K = function() {
                        return klass.apply(this, params);
                    };
                    K.prototype = klass.prototype;

                    return new K();
                }
            }
        }
    };
});
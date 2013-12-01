clazz('Service', 'Abstract', function(injector) {
    return {
        methods: {
            getName: function() {
                return 'service'
            },
            getParamsDefinitions: function() {
                return {
                    class: {
                        type: ['function'],
                        required: true,
                        converters: {
                            resolve: function(klass) {
                                if (_.isString(klass)) {
                                    klass = injector.get(klass);
                                }
                                return klass;
                            }
                        }
                    },
                    init: {
                        type: ['array'],
                        default: [],
                        converters: {
                            resolve: function(initParams) {
                                initParams = [].concat(initParams);
                                for (var i = 0, ii = initParams.length; i < ii; ++i) {
                                    if (_.isString(initParams[i])) {
                                        initParams[i] = injector.get(initParams[i]);
                                    }
                                }
                                return initParams;
                            }
                        }
                    },
                    call: {
                        type: ['hash', { element: { type: 'array' }}],
                        default: {},
                        converters: {
                            resolve: function(methods) {
                                for (var method in methods) {

                                    methods[method] = [].concat(methods[method]);

                                    for (var i = 0, ii = methods[method].length; i < ii; ++i) {
                                        if (_.isString(methods[method][i])) {
                                            methods[method][i] = injector.get(methods[method][i]);
                                        }
                                    }
                                }
                                return methods;
                            }
                        }
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
;
(function(global, name, dependencies, factory) {
    // AMD integration
    if (typeof define === 'function' && define.amd) {
        define(name, dependencies, factory);
    }
    // CommonJS integration
    else if (typeof exports === "object" && exports) {
        for (var i = 0, ii = dependencies.length; i < ii; ++i) {
            var dependency = dependencies[i];
            if (typeof dependency === 'string') {
                dependency = dependency.replace(/([A-Z]+)/g, function($1) {
                    return '-' + $1.toLowerCase();
                }).replace(/^-/, '');
                dependencies[i] = require(dependency);
            }
        }
        var module = factory.apply(global, dependencies);

        for (var property in module) {
            exports[property] = module[property];
        }
    }
    // Just global variable
    else {
        for (var i = 0, ii = dependencies.length; i < ii; ++i) {
            var dependency = dependencies[i];
            if (typeof dependency === 'string') {
                if (!(dependency in global)) {
                    throw new Error('"' + name + '" dependent on non exited module "' + dependency + '"!');
                }
                dependencies[i] = global[dependency];
            }
        }
        global[name] = factory.apply(global, dependencies);
    }
}((new Function('return this'))(), 'InjectorJS', ['ClazzJS'], function(ClazzJS, undefined) {

    var namespace = ClazzJS.namespace;
    var clazz = ClazzJS.clazz;
    var meta = ClazzJS.meta;

    namespace('InjectorJS', function(clazz, namespace) {

        clazz('Injector', function(self) {
            return {
                properties: {
                    defaultType: {
                        type: ['string'],
                        constraints: {
                            typeFactoryExists: function(type) {
                                return this.hasTypeFactory(type);
                            }
                        }
                    },
                    typeFactory: {
                        type: ['hash', {
                            element: ['object', {
                                instanceof: 'TypeFactories/Abstract'
                            }]
                        }],
                        default: {}
                    },
                    createdObject: {
                        type: ['hash'],
                        default: {}
                    },
                    objectFactory: {
                        type: ['hash'],
                        default: {}
                    }
                },
                methods: {
                    has: function(name) {
                        return this.hasCreatedObject(name) || this.hasObjectFactory(name);
                    },
                    get: function(name) {
                        if (!this.hasCreatedObject(name)) {
                            if (!this.hasObjectFactory(name)) {
                                throw new Error('Factory for object "' + name + "' does not exists!'");
                            }
                            this.setCreatedObject(name, this.getObjectFactory(name).call());
                            this.removeObjectFactory(name);
                        }

                        return this.getCreatedObject(name);
                    },
                    set: function(name, type, params) {
                        if (_.isObject(name)) {
                            var objects = name;
                            for (name in objects) {

                                params = objects[name];
                                type = params.type;
                                delete params.type;

                                this.setObjectFactory(name, this.createFactoryMethod(type, params));
                            }
                        } else {
                            this.setObjectFactory(name, this.createFactoryMethod(type, params));
                        }
                        return this;
                    },

                    createFactoryMethod: function(type, params) {

                        if (_.isUndefined(params)) {
                            params = type;
                            type = undefined;
                        }

                        if (_.isUndefined(type)) {
                            if (!this.hasDefaultType()) {
                                throw new Error('You must specify type for object "' + name + '"!');
                            }
                            type = this.getDefaultType();
                        }

                        return this.getTypeFactory(type).getFactoryMethod(params);
                    }
                }
            }
        });
        clazz('ParameterProcessor', function(self) {
            return {
                constants: {
                    PROCESSORS: {
                        type: meta('/ClazzJS/Property/Type'),
                        constraints: meta('/ClazzJS/Property/Constraints'),
                        converters: meta('/ClazzJS/Property/Converters')
                    }
                },
                methods: {
                    process: function(value, meta, name, object) {

                        var options = ['converters', 'constraints', 'default', 'type'];

                        for (var i = 0, ii = options.length; i < ii; ++i) {
                            if (!(options[i] in meta)) {
                                continue;
                            }

                            switch (options[i]) {

                                case 'type':
                                case 'constraints':
                                case 'converters':
                                    value = this.const('PROCESSORS')(options[i])().apply(value, meta[options[i]], name, object);
                                    break;

                                case 'default':
                                    var defaultValue = meta[options[i]];

                                    if (_.isFunction(defaultValue)) {
                                        defaultValue = defaultValue.call(object);
                                    }
                                    if (_.isUndefined(value) || _.isNull(value)) {
                                        value = defaultValue;
                                    }
                                    break;
                            }
                        }
                        return value;
                    }
                }
            }
        });
        namespace('TypeFactories', function(clazz) {
            clazz('Abstract', function(self, parameterProcessor) {
                return {
                    methods: {
                        getName: function() {
                            this.__abstract()
                        },
                        getFactoryMethod: function(params) {
                            var self = this;
                            return function() {
                                return self.createObject(self.processParams(params));
                            }
                        },
                        createObject: function() {
                            this.__abstract();
                        },
                        getParamsDefinitions: function() {
                            return {};
                        },
                        processParams: function(params) {

                            var paramsDefinition = this.getParamsDefinitions();

                            for (var param in params) {
                                if (!(param in paramsDefinition)) {
                                    throw new Error('Parameter "' + param + '" does not defined!');
                                }
                                params[param] = parameterProcessor.process(params[param], paramsDefinition[param], param, this);
                            }

                            return params;
                        }
                    }
                };
            });
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
            clazz('Parameter', 'Abstract', function(self) {
                return {
                    methods: {
                        getName: function() {
                            return 'parameter';
                        },
                        processParams: function(value) {
                            if (_.isFunction(value)) {
                                value = value();
                            }
                            return value;
                        },
                        createObject: function(value) {
                            return value;
                        }
                    }
                };
            });
            clazz('Service', 'Abstract', function(self, injector) {
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
                                    type: ['hash', {
                                        element: {
                                            type: 'array'
                                        }
                                    }],
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
        });

    });


    var Injector = clazz('/InjectorJS/Injector');
    var ParameterProcessor = clazz('/InjectorJS/ParameterProcessor');

    var injector = Injector.create();
    var parameterProcessor = ParameterProcessor.create();

    var AbstractTypeFactory = clazz('/InjectorJS/TypeFactories/Abstract', [parameterProcessor]);

    var ParameterTypeFactory = clazz('/InjectorJS/TypeFactories/Parameter', AbstractTypeFactory);
    var ClazzTypeFactory = clazz('/InjectorJS/TypeFactories/Clazz', AbstractTypeFactory, [clazz, injector]);
    var ServiceTypeFactory = clazz('/InjectorJS/TypeFactories/Service', AbstractTypeFactory, [injector]);

    var parameterTypeFactory = ParameterTypeFactory.create();
    var clazzTypeFactory = ClazzTypeFactory.create();
    var serviceTypeFactory = ServiceTypeFactory.create();

    injector
        .setTypeFactory(parameterTypeFactory.getName(), parameterTypeFactory)
        .setTypeFactory(clazzTypeFactory.getName(), clazzTypeFactory)
        .setTypeFactory(serviceTypeFactory.getName(), serviceTypeFactory)
        .setDefaultType(parameterTypeFactory.getName());

    return {
        TypeFactory: {
            Abstract: AbstractTypeFactory,
            Parameter: ParameterTypeFactory,
            Clazz: ClazzTypeFactory,
            Service: ServiceTypeFactory
        },
        Injector: Injector,
        ParameterProcessor: ParameterProcessor,

        injector: injector,
        parameterProcessor: parameterProcessor
    };

}));

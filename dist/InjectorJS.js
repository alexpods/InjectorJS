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
                    defaultFactory: {
                        type: ['object', {
                            instanceOf: 'Factories/Abstract'
                        }],
                        constraints: {
                            exists: function(factory) {
                                return this.hasFactory(factory.getName());
                            }
                        }
                    },
                    factory: {
                        type: ['hash', {
                            element: ['object', {
                                instanceOf: 'Factories/Abstract'
                            }]
                        }],
                        default: {}
                    },
                    object: {
                        type: ['hash'],
                        default: {}
                    },
                    objectCreator: {
                        type: ['hash'],
                        default: {}
                    },
                    getter: {
                        type: ['function']
                    }
                },
                methods: {
                    has: function(name) {
                        return this.hasObject(name) || this.hasObjectCreator(name);
                    },
                    get: function(name) {
                        if (!this.hasObject([name])) {
                            if (!this.hasObjectCreator([name])) {
                                throw new Error('Factory method for object "' + name + "' does not exists!'");
                            }
                            this.setObject([name], this.getObjectCreator([name]).call());
                            this.removeObjectCreator([name]);
                        }

                        return this.getObject([name]);
                    },
                    set: function( /* (name, type, factory) | (types) */ ) {
                        if (_.isObject(arguments[0])) {
                            var factories = arguments[0];

                            for (var factory in factories) {
                                for (var name in factories[factory]) {
                                    this.setObjectCreator([name], this.createObjectCreator(factory, factories[factory][name]));
                                }
                            }
                        } else {
                            this.setObjectCreator([arguments[0]], this.createObjectCreator(arguments[1], arguments[2]));
                        }
                        return this;
                    },

                    getGetterMethod: function() {
                        if (!this.hasGetter()) {
                            var that = this;

                            this.setGetter(function(name) {
                                return that.get(name);
                            })
                        }

                        return this.getGetter();
                    },

                    createObjectCreator: function(factoryName, factoryMethod) {

                        if (_.isUndefined(factoryName)) {
                            factoryMethod = factoryName;
                            factoryName = undefined;
                        }

                        var that = this;
                        var factory = !_.isUndefined(factoryName) ? this.getFactory(factoryName) : this.getDefaultFactory();

                        return function() {

                            var params = _.isFunction(factoryMethod) ? factoryMethod.call(factory, that.getGetterMethod()) : factoryMethod;

                            return factory.create(params);
                        }
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
                                    value = this.const('PROCESSORS')(options[i])().apply(value, meta[options[i]], name, [], object);
                                    break;

                                case 'default':
                                    var defaultValue = meta[options[i]];

                                    if (_.isFunction(defaultValue)) {
                                        defaultValue = defaultValue.call();
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
        namespace('Factories', function(clazz) {
            clazz('Abstract', function(self, parameterProcessor) {
                return {
                    methods: {
                        getName: function() {
                            throw new Error('You must specify type name in child clazz!');
                        },
                        create: function(params) {
                            return this.createObject(this.processParams(params));
                        },
                        createObject: function(params) {
                            throw new Error('You must realize "createObject" method in child clazz!');
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
            clazz('Parameter', 'Abstract', function(self) {
                return {
                    methods: {
                        getName: function() {
                            return 'parameter';
                        },
                        create: function(value) {
                            return value;
                        }
                    }
                };
            });
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
                                    type: ['hash', {
                                        element: {
                                            type: 'array'
                                        }
                                    }],
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
        });

    });


    var Injector = clazz('/InjectorJS/Injector');
    var ParameterProcessor = clazz('/InjectorJS/ParameterProcessor');

    var injector = Injector.create();
    var parameterProcessor = ParameterProcessor.create();

    var AbstractFactory = clazz('/InjectorJS/Factories/Abstract', [parameterProcessor]);

    var ParameterFactory = clazz('/InjectorJS/Factories/Parameter', AbstractFactory);
    var ClazzFactory = clazz('/InjectorJS/Factories/Clazz', AbstractFactory, [clazz]);
    var ServiceFactory = clazz('/InjectorJS/Factories/Service', AbstractFactory);

    var parameterFactory = ParameterFactory.create();
    var clazzFactory = ClazzFactory.create();
    var serviceFactory = ServiceFactory.create();

    injector
        .setFactory(parameterFactory.getName(), parameterFactory)
        .setFactory(clazzFactory.getName(), clazzFactory)
        .setFactory(serviceFactory.getName(), serviceFactory)
        .setDefaultFactory(parameterFactory);

    return {
        Factory: {
            Abstract: AbstractFactory,
            Parameter: ParameterFactory,
            Clazz: ClazzFactory,
            Service: ServiceFactory
        },
        Injector: Injector,
        ParameterProcessor: ParameterProcessor,

        injector: injector,
        parameterProcessor: parameterProcessor
    };

}));

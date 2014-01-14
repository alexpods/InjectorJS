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
    var clazz = namespace('InjectorJS').get('clazz');
    var meta = namespace('InjectorJS').get('meta');
    var _ = ClazzJS._;

    namespace('InjectorJS', function(clazz, namespace) {

        clazz('Injector', function(self) {
            return {
                properties: {
                    factory: {
                        type: ['hash'],
                        default: {}
                    },
                    defaultFactory: {
                        converters: {
                            fromString: function(factory) {
                                if (_.isUndefined(factory)) {
                                    factory = this.getFactory(factory);
                                }
                                return factory;
                            }
                        },
                        constraints: {
                            exists: function(factory) {
                                return this.hasFactory(factory);
                            }
                        },
                        default: function() {
                            var factory = clazz('Factories/Object').create();

                            if (!this.hasFactory(factory)) {
                                this.setFactory(factory);
                            }
                            return factory;
                        }
                    },
                    _object: {
                        type: ['hash'],
                        default: {}
                    },
                    _objectCreator: {
                        type: ['hash'],
                        default: {}
                    }
                },
                methods: {

                    set: function(name, factory, object) {

                        var that = this;
                        var objects = this._resolveObjects(name, factory, object);

                        _.each(objects, function(factoryObjects, factory) {
                            _.each(factoryObjects, function(object, name) {
                                that._setObjectCreator([name], that._createObjectCreator(factory, object));
                            });
                        });

                        return this;
                    },

                    has: function(name) {
                        return this._hasObject([name]) || this._hasObjectCreator([name]);
                    },

                    get: function(name) {
                        this._checkObject(name);

                        if (!this._hasObject([name])) {
                            this._setObject([name], this._getObjectCreator([name]).call())._removeObjectCreator([name]);
                        }
                        return this._getObject([name]);
                    },

                    remove: function(name) {
                        this._checkObject(name);

                        return (this._hasObject([name]) && this._removeObject([name])) || (this._hasObjectCreator([name]) && this._removeObjectCreator([name]));
                    },

                    setFactory: function(factory) {
                        if (factory && factory.__clazz && factory.__clazz.__isSubclazzOf('/InjectorJS/Factories/Abstract')) {
                            return this.__setPropertyValue(['factory', factory.getName()], factory);
                        }
                        return this.__setPropertyValue.apply(this, ['factory'].concat(_.toArray(arguments)));
                    },

                    hasFactory: function(factory) {
                        var factoryName = _.isString(factory) ? factory : factory.getName();
                        return this.__hasPropertyValue(['factory', factoryName]);
                    },

                    setDefaultFactory: function(factory) {
                        return this.setFactory(factory);
                    },

                    _checkObject: function(name) {
                        if (!this.has(name)) {
                            throw new Error('Object "' + name + "' does not exists!'");

                        }
                    },

                    _resolveObjects: function(name, factory, object) {

                        var that = this;
                        var objects = {};
                        var defaultFactory = this.getDefaultFactory().getName();

                        if (_.isObject(name)) {
                            objects = name;
                        } else {
                            if (_.isUndefined(object)) {
                                object = factory;
                                factory = undefined;
                            }

                            if (_.isUndefined(factory)) {
                                factory = defaultFactory;
                            }

                            objects[factory] = {};
                            objects[factory][name] = object;
                        }

                        _.each(objects, function(factoryObjects, factory) {
                            if (!that.hasFactory(factory)) {
                                if (!(defaultFactory in objects)) {
                                    objects[defaultFactory] = {};
                                }

                                objects[defaultFactory][factory] = factoryObjects;
                                delete objects[factory];
                            }
                        });

                        return objects;
                    },

                    _createObjectCreator: function(factoryName, object) {
                        if (_.isUndefined(object)) {
                            object = factoryName;
                            factoryName = undefined;
                        }

                        var that = this;

                        return function() {

                            var factory = !_.isUndefined(factoryName) ? that.getFactory(factoryName) : that.getDefaultFactory();

                            var params = _.isFunction(object) ? object.call(that) : object;

                            return _.isFunction(factory) ? factory(params) : factory.create(params);
                        }
                    }
                }
            }
        });
        clazz('ParameterProcessor', function(self) {
            return {
                properties: {
                    processor: {
                        type: ['hash', {
                            element: 'function'
                        }],
                        default: function() {
                            return {
                                type: function(paramValue, metaData, paramName, object) {
                                    return meta('/ClazzJS/Property/Type').apply(paramValue, metaData, paramName, [], object);
                                },
                                constraints: function(paramValue, metaData, paramName, object) {
                                    return meta('/ClazzJS/Property/Constraints').apply(paramValue, metaData, paramName, [], object);
                                },
                                converters: function(paramValue, metaData, paramName, object) {
                                    return meta('/ClazzJS/Property/Converters').apply(paramValue, metaData, paramName, [], object);
                                },
                                default: function(paramValue, metaData, paramName, object) {
                                    if (_.isUndefined(paramValue) || _.isNull(paramValue)) {
                                        paramValue = _.isFunction(metaData) ? metaData.call(object) : metaData;
                                    }
                                    return paramValue;
                                }
                            };
                        }
                    }
                },
                methods: {
                    process: function(paramValue, metaData, paramName, object) {

                        paramName = paramName || 'unknown';
                        object = object || this;

                        var that = this;
                        var processors = this.getProcessor();

                        _.each(metaData, function(data, option) {
                            if (!(option in processors)) {
                                return;
                            }

                            paramValue = processors[option].call(that, paramValue, data, paramName, object);
                        });

                        return paramValue;
                    }
                }
            }
        });
        namespace('Factories', function(clazz) {
            clazz('Abstract', function(self) {
                return {
                    properties: {
                        parameterProcessor: {
                            type: ['object', {
                                instanceOf: '/InjectorJS/ParameterProcessor'
                            }],
                            default: function() {
                                return clazz('/InjectorJS/ParameterProcessor').create();
                            }
                        }
                    },
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
                        getParamsDefinition: function() {
                            return {};
                        },
                        processParams: function(params) {

                            var that = this;
                            var paramsDefinition = this.getParamsDefinition();
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
            clazz('Object', 'Abstract', function(self) {
                return {
                    methods: {
                        getName: function() {
                            return 'object';
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
                                    type: ['hash', {
                                        element: 'array'
                                    }],
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
        });

    });

    var Injector = clazz('Injector');
    var ParameterProcessor = clazz('ParameterProcessor');
    var parameterProcessor = ParameterProcessor.create();

    var AbstractFactory = clazz('Factories/Abstract');

    var ObjectFactory = clazz('Factories/Object', AbstractFactory);
    var ClazzFactory = clazz('Factories/Clazz', AbstractFactory);
    var ServiceFactory = clazz('Factories/Service', AbstractFactory);

    var objectFactory = ObjectFactory.create();
    var clazzFactory = ClazzFactory.create();
    var serviceFactory = ServiceFactory.create();

    var injector = Injector.create()
        .setFactory(objectFactory)
        .setFactory(clazzFactory)
        .setFactory(serviceFactory)
        .setDefaultFactory(objectFactory);

    return {
        Factory: {
            Abstract: AbstractFactory,
            Object: ObjectFactory,
            Clazz: ClazzFactory,
            Service: ServiceFactory
        },

        Injector: Injector,
        ParameterProcessor: ParameterProcessor,

        injector: injector,
        parameterProcessor: parameterProcessor
    };

}));

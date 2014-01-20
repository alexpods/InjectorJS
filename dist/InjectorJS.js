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


        /**
         * Injector
         * Realization of DI container.
         *
         * @class
         */
        clazz('Injector', function(self) {
            return {
                properties: {

                    /**
                     * Supported factories
                     * @var {object}
                     */
                    factory: {
                        type: ['hash'],
                        default: {}
                    },

                    /**
                     * Default factory
                     * @var {AbstractFactory}
                     */
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

                    /**
                     * Created objects in the container
                     * @var {object}
                     */
                    _object: {
                        type: ['hash'],
                        default: {}
                    },

                    /**
                     * Object creators. Used when gets some object.
                     * @var {object}
                     */
                    _objectCreator: {
                        type: ['hash'],
                        default: {}
                    }
                },
                methods: {

                    /**
                     * Sets new object to the container
                     *
                     * @param {string|object} name      Object name or hash of the objects
                     * @param {string}        factory   Factory name
                     * @param {*}             object    Object or its factory method
                     * @returns {Injector} this
                     *
                     * @this {Injector}
                     */
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

                    /**
                     * Checks whether specified object exist
                     *
                     * @param {string} name Object name
                     * @returns {boolean} true if specified object exist
                     *
                     * @this {Injector}
                     */
                    has: function(name) {
                        return this._hasObject([name]) || this._hasObjectCreator([name]);
                    },

                    /**
                     * Gets specified object
                     *
                     * @param {string} name Object name
                     * @returns {*} Specified object
                     *
                     * @throws {Error} if specified object does not exist
                     *
                     * @this {Injector}
                     */
                    get: function(name) {
                        this._checkObject(name);

                        if (!this._hasObject([name])) {
                            this._setObject([name], this._getObjectCreator([name]).call())._removeObjectCreator([name]);
                        }
                        return this._getObject([name]);
                    },

                    /**
                     * Removes specified object
                     *
                     * @param {string} name Object name
                     * @returns {Injector} this
                     *
                     * @throws {Error} if specified object does not exist
                     *
                     * @this {Injector}
                     */
                    remove: function(name) {
                        this._checkObject(name);

                        return (this._hasObject([name]) && this._removeObject([name])) || (this._hasObjectCreator([name]) && this._removeObjectCreator([name]));
                    },

                    /**
                     * Sets object factory
                     *
                     * @param {string,Factory}   name     Factory name of factory instance
                     * @param {function|Factory} factory  Object factory
                     * @returns {Injector} this
                     *
                     * @this {Injector}
                     */
                    setFactory: function(name, factory) {
                        if (_.isUndefined(factory)) {
                            factory = name;
                            name = undefined;
                        }

                        if (factory && factory.__clazz && factory.__clazz.__isSubclazzOf('/InjectorJS/Factories/Abstract')) {
                            return this.__setPropertyValue(['factory', factory.getName()], factory);
                        }

                        var fields = _.isString(name) ? name.split('.') : name || [];

                        return this.__setPropertyValue(['factory'].concat(fields), factory);
                    },

                    /**
                     * Checks whether specified factory exist
                     *
                     * @param {string|Factory} factory Object factory or its name
                     * @returns {boolean} true if object factory exist
                     *
                     * @this {Injector}
                     */
                    hasFactory: function(factory) {
                        var factoryName = _.isString(factory) ? factory : factory.getName();
                        return this.__hasPropertyValue(['factory', factoryName]);
                    },

                    /**
                     * Sets default factory
                     * @param {string|Factory} factory Default factory or its name
                     * @returns {Injector} this
                     *
                     * @this {Injector}
                     */
                    setDefaultFactory: function(factory) {
                        return this.setFactory(factory);
                    },

                    /**
                     * Checks whether specified object exist
                     *
                     * @param {string} name Object name
                     * @returns {Injector} this
                     *
                     * @throws {Error} if specified object does not exist
                     *
                     * @this {Injector}
                     * @private
                     */
                    _checkObject: function(name) {
                        if (!this.has(name)) {
                            throw new Error('Object "' + name + "' does not exists!'");

                        }
                        return this;
                    },

                    /**
                     * Resolves specified objects
                     *
                     * @see set() method
                     *
                     * @param {string|object} name      Object name or hash of the objects
                     * @param {string}        factory   Factory name
                     * @param {*}             object    Object or its factory method
                     * @returns {object} Resolved objects
                     *
                     * @this {Injector}
                     * @private
                     */
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

                    /**
                     * Creates object creator
                     *
                     * @param {string}    factoryName Factory name
                     * @param {*|factory} object      Object or its factory function
                     * @returns {Function} Object     creator
                     *
                     * @this {Injector}
                     * @private
                     */
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

        /**
         * Parameter processor
         * Checks and convert parameter value
         *
         * @class
         */
        clazz('ParameterProcessor', function(self) {
            return {
                properties: {

                    /**
                     * Processors
                     * By default there are four processors: type, constraints, converters and default
                     * @var {object}
                     */
                    processor: {
                        type: ['hash', {
                            element: 'function'
                        }],
                        default: function() {
                            return {
                                type: function(value, metaData, name, object) {
                                    return meta('/ClazzJS/Property/Type').apply(value, metaData, name, [], object);
                                },
                                constraints: function(value, metaData, name, object) {
                                    return meta('/ClazzJS/Property/Constraints').apply(value, metaData, name, [], object);
                                },
                                converters: function(value, metaData, name, object) {
                                    return meta('/ClazzJS/Property/Converters').apply(value, metaData, name, [], object);
                                },
                                "default": function(value, metaData, name, object) {
                                    if (_.isUndefined(value) || _.isNull(value)) {
                                        value = _.isFunction(metaData) ? metaData.call(object) : metaData;
                                    }
                                    return value;
                                }
                            };
                        }
                    }
                },
                methods: {

                    /**
                     * Process parameter value
                     *
                     * @param {*}      value     Parameter value
                     * @param {object} metaData  Meta data for parameter
                     * @param {string} name      Parameter name
                     * @param {object} object    Object of specified parameter
                     * @returns {*} Processed parameter value
                     *
                     * @this {ParameterProcessor}
                     */
                    process: function(value, metaData, name, object) {

                        name = name || 'unknown';
                        object = object || this;

                        var that = this;
                        var processors = this.getProcessor();

                        _.each(metaData, function(data, option) {
                            if (!(option in processors)) {
                                return;
                            }

                            value = processors[option].call(that, value, data, name, object);
                        });

                        return value;
                    }
                }
            }
        });

        namespace('Factories', function(clazz) {

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
                            type: ['object', {
                                instanceOf: '/InjectorJS/ParameterProcessor'
                            }],
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

            /**
             * Object object factory
             * Just returns specified value
             *
             * @typedef {function} ObjectFactory
             * @class
             */
            clazz('Object', 'Abstract', function(self) {
                return {
                    methods: {

                        /**
                         * Gets object factory name
                         * @returns {string} Object factory name
                         *
                         * @this {ObjectFactory}
                         */
                        getName: function() {
                            return 'object';
                        },

                        /**
                         * Creates object
                         * Just returns specified value
                         *
                         * @param {*} value Some value (must be returned)
                         * @returns {*} Unprocessed value
                         *
                         * @this {AbstractFactory}
                         */
                        create: function(value) {
                            return value;
                        }
                    }
                };
            });

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
                                    type: ['hash', {
                                        element: 'array'
                                    }],
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

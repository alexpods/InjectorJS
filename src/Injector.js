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

                var that    = this;
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

                return (this._hasObject([name]) && this._removeObject([name]))
                    || (this._hasObjectCreator([name]) && this._removeObjectCreator([name]));
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
                }
                else {
                    if (_.isUndefined(object)) {
                        object    = factory;
                        factory   = undefined;
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
                    object      = factoryName;
                    factoryName = undefined;
                }

                var that = this;

                return function() {

                    var factory = !_.isUndefined(factoryName)
                        ? that.getFactory(factoryName)
                        : that.getDefaultFactory();

                    var params  = _.isFunction(object)
                        ? object.call(that)
                        : object;

                    return _.isFunction(factory) ? factory(params) : factory.create(params);
                }
            }
        }
    }
});
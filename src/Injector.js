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

                var that    = this;
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

                return (this._hasObject([name]) && this._removeObject([name]))
                    || (this._hasObjectCreator([name]) && this._removeObjectCreator([name]));
            },

            setFactory: function(fields, value) {
                if (_.isUndefined(value)) {
                    value = fields;
                    fields = undefined;
                }

                if (value && value.__clazz && value.__clazz.__isSubclazzOf('/InjectorJS/Factories/Abstract')) {
                    return this.__setPropertyValue(['factory', value.getName()], value);
                }
                return this.__setPropertyValue(['factory'].concat(_.isString(fields) ? fields.split('.') : fields || []), value);
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

            _createObjectCreator: function(factoryName, object) {
                if (_.isUndefined(object)) {
                    object      = factoryName;
                    factoryName = undefined;
                }

                var that    = this;

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
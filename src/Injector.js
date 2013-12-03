clazz('Injector', function(self) {
    return {
        properties: {
            defaultFactory: {
                type: ['object'],
                constraints: {
                    exists: function(factory) {
                        return this.hasFactory(factory.getName());
                    }
                }
            },
            factory: {
                type: ['hash', { element: ['object', { instanceof: 'Factories/Abstract' }] }],
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
                if (!this.hasObject(name)) {
                    if (!this.hasObjectCreator(name)) {
                        throw new Error('Factory method for object "' + name + "' does not exists!'");
                    }
                    this.setObject(name, this.getObjectCreator(name).call());
                    this.removeObjectCreator(name);
                }

                return this.getObject(name);
            },
            set: function(/* (name, type, factory) | (types) */) {
                if (_.isObject(arguments[0])) {
                    var factories = arguments[0];

                    for (var factory in factories) {
                        for (var name in factories[factory]) {
                            this.setObjectCreator(name, this.createObjectCreator(factory, factories[factory][name]));
                        }
                    }
                }
                else {
                    this.setObjectCreator(arguments[0], this.createObjectCreator(arguments[1], arguments[2]));
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
                    factoryName   = undefined;
                }

                var that    = this;
                var factory = !_.isUndefined(factoryName) ? this.getFactory(factoryName) : this.getDefaultFactory();

                return function() {

                    var params  = _.isFunction(factoryMethod)
                        ? factoryMethod.call(factory, that.getGetterMethod())
                        : factoryMethod;

                    return factory.create(params);
                }
            }
        }
    }
});
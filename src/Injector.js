clazz('Injector', function() {
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
                type: ['hash', { element: ['object', { instanceof: 'TypeFactories/Abstract' }] }],
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
                        type   = params.type;
                        delete params.type;

                        this.setObjectFactory(name, this.createFactoryMethod(type, params));
                    }
                }
                else {
                    this.setObjectFactory(name, this.createFactoryMethod(type, params));
                }
                return this;
            },

            createFactoryMethod: function(type, params) {

                if (_.isUndefined(params)) {
                    params = type;
                    type   = undefined;
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
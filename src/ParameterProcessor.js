clazz('ParameterProcessor', function(self) {
    return {
        constants: {
            PROCESSORS: {
                type:        meta('/ClazzJS/Property/Type'),
                constraints: meta('/ClazzJS/Property/Constraints'),
                converters:  meta('/ClazzJS/Property/Converters')
            }
        },
        methods: {
            process: function(value, meta, name, object) {
                for (var option in meta) {

                    switch (option) {

                        case 'type':
                        case 'constraints':
                        case 'converters':
                            value = this.const('PROCESSORS')(option)().apply(value, meta[option], name, object);
                            break;

                        case 'default':
                            var defaultValue = meta[option];

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
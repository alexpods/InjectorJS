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
            process: function(value, meta, name) {

                var options = ['converters', 'constraints', 'default', 'type'];

                for (var i = 0, ii = options.length; i < ii; ++i) {
                    if (!(options[i] in meta)) {
                        continue;
                    }

                    switch (options[i]) {

                        case 'type':
                        case 'constraints':
                        case 'converters':
                            value = this.const('PROCESSORS')(options[i])().apply(value, meta[options[i]], name);
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
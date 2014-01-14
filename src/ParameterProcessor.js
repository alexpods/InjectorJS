clazz('ParameterProcessor', function(self) {
    return {
        properties: {
            processor: {
                type: ['hash', { element: 'function' }],
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
                                paramValue = _.isFunction(metaData)
                                    ? metaData.call(object)
                                    : metaData;
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
                object    = object || this;

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
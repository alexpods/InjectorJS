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
                type: ['hash', { element: 'function' }],
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
                                value = _.isFunction(metaData)
                                    ? metaData.call(object)
                                    : metaData;
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

                name   = name   || 'unknown';
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
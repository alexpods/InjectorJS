clazz('Abstract', function(self) {
    return {
        properties: {
            parameterProcessor: {
                type: ['object', { instanceOf: '/InjectorJS/ParameterProcessor' }],
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
                var paramsDefinition   = this.getParamsDefinition();
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
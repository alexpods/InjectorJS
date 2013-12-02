clazz('Abstract', function(self, parameterProcessor) {
    return {
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
            getParamsDefinitions: function() {
                return {};
            },
            processParams: function(params) {

                var paramsDefinition = this.getParamsDefinitions();

                for (var param in params) {
                    if (!(param in paramsDefinition)) {
                        throw new Error('Parameter "' + param + '" does not defined!');
                    }
                    params[param] = parameterProcessor.process(params[param], paramsDefinition[param], param);
                }

                return params;
            }
        }
    };
});
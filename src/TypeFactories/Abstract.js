clazz('Abstract', function(parameterProcessor) {
    return {
        methods: {
            getName: function() {
                this.__abstract()
            },
            getFactoryMethod: function(params) {
                var self = this;
                return function() {
                    return self.createObject(self.processParams(params));
                }
            },
            createObject: function() {
                this.__abstract();
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
                    params[param] = parameterProcessor.process(params[param], paramsDefinition[param], param, this);
                }

                return params;
            }
        }
    };
});
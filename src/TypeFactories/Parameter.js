clazz('Parameter', 'Abstract', function() {
    return {
        methods: {
            getName: function() {
                return 'parameter';
            },
            processParams: function(value) {
                if (_.isFunction(value)) {
                    value = value();
                }
                return value;
            },
            createObject: function(value) {
                return value;
            }
        }
    };
});
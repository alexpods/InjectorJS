clazz('Parameter', 'Abstract', function(self) {
    return {
        methods: {
            getName: function() {
                return 'parameter';
            },
            create: function(value) {
                return value;
            }
        }
    };
});
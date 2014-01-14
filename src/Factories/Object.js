clazz('Object', 'Abstract', function(self) {
    return {
        methods: {
            getName: function() {
                return 'object';
            },
            create: function(value) {
                return value;
            }
        }
    };
});
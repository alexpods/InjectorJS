/**
 * Object object factory
 * Just returns specified value
 *
 * @typedef {function} ObjectFactory
 * @class
 */
clazz('Object', 'Abstract', function(self) {
    return {
        methods: {

            /**
             * Gets object factory name
             * @returns {string} Object factory name
             *
             * @this {ObjectFactory}
             */
            getName: function() {
                return 'object';
            },

            /**
             * Creates object
             * Just returns specified value
             *
             * @param {*} value Some value (must be returned)
             * @returns {*} Unprocessed value
             *
             * @this {AbstractFactory}
             */
            create: function(value) {
                return value;
            }
        }
    };
});
'use strict';

describe('Object factory', function() {
    var objectFactory;

    beforeEach(function() {
        var ObjectFactory = clazz('Factories/Object');

        objectFactory = ObjectFactory.create();
    });

    it('should just return specified object', function() {

        expect(objectFactory.create(10)).toBe(10);
        expect(objectFactory.create('some_value')).toBe('some_value');
        expect(objectFactory.create('some_value')).not.toBe('another_value');
    });
});
'use strict';

describe('Injector', function() {
    var injector;

    beforeEach(function() {
        var Injector = clazz('Injector');

        injector = Injector.create();
    });

    it('should set/get/remove object', function() {

        expect(injector.has('some_object')).toBe(false);
        expect(injector.set('some_object', 10)).toBe(injector);
        expect(injector.has('some_object')).toBe(true);
        expect(injector.get('some_object')).toBe(10);
        expect(injector.remove('some_object')).toBe(injector);
        expect(injector.has('some_object')).toBe(false);
        expect(function() { injector.get('some_object') }).toThrow();
        expect(function() { injector.remove('some_object') }).toThrow();
    });

    it('should set several objects', function() {

        expect(injector.has('name1')).toBe(false);
        expect(injector.set({
            name1: 10,
            name2: 'something'
        })).toBe(injector);
        expect(injector.has('name1')).toBe(true);
        expect(injector.get('name1')).toBe(10);
        expect(injector.has('name2')).toBe(true);
        expect(injector.has('name3')).toBe(false);
    });

    it('should set object factory function', function() {

        expect(injector.has('object')).toBe(false);
        expect(injector.set('object', function() {
            return 10
        })).toBe(injector);
        expect(injector.has('object')).toBe(true);
        expect(injector.get('object')).toBe(10);
    });

    it('should set objects factory functions', function() {

        expect(injector.has('name')).toBe(false);
        expect(injector.set({
            object: {
                name: function() {
                    return 'something';
                }
            }
        }));
        expect(injector.has('name')).toBe(true);
        expect(injector.get('name')).toBe('something');
    });

    it ('should set/get/remove factory', function() {
        var serviceFactory = clazz('Factories/Service').create();

        expect(injector.hasFactory(serviceFactory)).toBe(false);
        expect(injector.setFactory(serviceFactory)).toBe(injector);
        expect(injector.hasFactory(serviceFactory)).toBe(true);
        expect(injector.getFactory(serviceFactory.getName())).toBe(serviceFactory);
        expect(injector.removeFactory(serviceFactory.getName())).toBe(injector);
        expect(injector.hasFactory(serviceFactory)).toBe(false);
        expect(function() { injector.getFactory(serviceFactory.getName()) }).toThrow();
    });

    it ('should set factory as function', function() {
        var factory;

        expect(injector.hasFactory('some_factory')).toBe(false);
        expect(injector.setFactory('some_factory', factory = function(value) {
            return 'some' + value;
        })).toBe(injector);
        expect(injector.hasFactory('some_factory')).toBe(true);
        expect(injector.getFactory('some_factory')).toBe(factory);
        
    });
});
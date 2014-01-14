'use strict';

describe('Service factory', function() {
    var serviceFactory;

    beforeEach(function() {
        var ServiceFactory = clazz('Factories/Service');

        serviceFactory = ServiceFactory.create();
    });

    it('should create class instance', function() {
        var service;

        var Person = function(value) {
            this.name  = undefined;
            this.value = value;
        };

        Person.prototype.setName = function(name) {
            this.name = name;
        };

        expect (function() {
            service = serviceFactory.create({
                class: Person,
                init: [10],
                call: {
                    setName: ['Hello']
                }
            });
        }).not.toThrow();

        expect(service instanceof Person).toBe(true);
        expect(service.value).toBe(10);
        expect(service.name).toBe('Hello');
    });
});
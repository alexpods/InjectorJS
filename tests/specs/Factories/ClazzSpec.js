'use strict';

describe('Clazz factory', function() {
    var clazzFactory, clazz = ClazzJS.clazz;

    beforeEach(function() {
        var ClazzFactory = clazz('/InjectorJS/Factories/Clazz');

        clazzFactory = ClazzFactory.create();
    });

    it('should create clazz', function() {
        var Clazz, instance;

        clazz('SomeClazz', function(self, deps1, deps2) {
            return {
                methods: {
                    getDeps1: function() {
                        return deps1;
                    },
                    getDeps2: function() {
                        return deps2;
                    }
                }
            }
        });

        var ParentClazz = function() {};
        ParentClazz.prototype.parentClazzMethod = function() {
            return 30;
        };


        expect (function() {
            Clazz = clazzFactory.create({
                name: 'SomeClazz',
                parent: ParentClazz,
                deps: [10, 20]
            });
        }).not.toThrow();

        expect(Clazz.__isSubclazzOf(ParentClazz)).toBe(true);

        instance = new Clazz();

        expect(instance instanceof Clazz).toBe(true);
        expect(instance instanceof ParentClazz).toBe(true);
        expect(instance.getDeps1()).toBe(10);
        expect(instance.getDeps2()).toBe(20);
        expect(instance.parentClazzMethod()).toBe(30);
    });
});
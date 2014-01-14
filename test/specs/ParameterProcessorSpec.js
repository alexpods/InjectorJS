'use strict';

describe('ParameterProcessor', function() {
    var parameterProcessor;

    beforeEach(function() {
        var ParameterProcessor = clazz('ParameterProcessor');

        parameterProcessor = ParameterProcessor.create()
            .setProcessor('append', function(value, data) {
                return value + '' + data;
            })
            .setProcessor('multiply', function(value, multiplier) {
                return value * multiplier;
            });
    });

    it('should set/get/remove processors', function() {
        var processor;

        expect(parameterProcessor.hasProcessor('some_processor')).toBe(false);
        expect(parameterProcessor.setProcessor('some_processor', processor = function(value) {
            // do some processing
            return value;
        })).toBe(parameterProcessor);
        expect(parameterProcessor.hasProcessor('some_processor')).toBe(true);
        expect(parameterProcessor.getProcessor('some_processor')).toBe(processor);
        expect(parameterProcessor.removeProcessor('some_processor')).toBe(parameterProcessor);
        expect(parameterProcessor.hasProcessor('some_processor')).toBe(false);
        expect(function() { parameterProcessor.getProcessor('some_processor') }).toThrow();
    });

    it('should process', function() {

        parameterProcessor
            .setProcessor('append', function(value, data) {
                return value + '' + data;
            })
            .setProcessor('multiply', function(value, multiplier) {
                return value*multiplier;
            });

        expect(parameterProcessor.process(10, { multiply: 4 })).toBe(40);
        expect(parameterProcessor.process('hello', { append: ' world' })).toBe('hello world');
    });
});
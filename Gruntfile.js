"use strict";

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        concat: {
            dev: {
                dest: "dist/<%= pkg.title %>.js",
                src: [
                    "src/.prefix",
                    "src/*.js",
                    "src/Factories/.prefix",
                    "src/Factories/*.js",
                    "src/Factories/.suffix",
                    "src/.build",
                    "src/.suffix"
                ]
            }
        },
        jasmine: {
            test: {
                src: ["<%= concat.dev.dest %>"],
                options: {
                    specs:   ['test/specs/**/*.js'],
                    vendor:  [
                        'node_modules/clazz-js/dist/ClazzJS.js',
                        'test/prefix.js'
                    ]
                }
            }
        },
        uglify: {
            min: {
                options: {
                    mangle: true,
                    compress: {
                        unused: false
                    },
                    report: 'gzip',
                    sourceMap: 'dist/<%= pkg.title %>.min.map',
                    preserveComments: false
                },
                dest: "dist/<%= pkg.title %>.min.js",
                src:  "<%= concat.dev.dest %>"
            }
        },
        jsbeautifier: {
            dev: {
                src:  ["<%= concat.dev.dest %>"]
            }
        }
    });

    grunt.registerTask('default', ['concat', 'jasmine', 'uglify', 'jsbeautifier']);
};
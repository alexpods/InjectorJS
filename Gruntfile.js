"use strict";

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        concat: {
            dev: {
                dest: "dist/<%= pkg.title %>.js",
                src: [
                    "src/.prefix",
                    "src/*.js",
                    "src/TypeFactories/.prefix",
                    "src/TypeFactories/*.js",
                    "src/TypeFactories/.suffix",
                    "src/.build",
                    "src/.suffix"
                ]
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
    })

    grunt.registerTask('default', ['concat', 'uglify', 'jsbeautifier']);
};
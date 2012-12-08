module.exports = function(grunt) {
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
    },
    concat: {
      ui: {
        src: ['ui/js/**.js'],
        dest: 'public/js/kod.js'
      },
      css: {
        src: ['ui/css/**.css'],
        dest: 'public/css/kod.css'
      }
    },
    lint: {
      core: ['grunt.js'],
      ui: ['ui/js/**.js'],
      server: ['server.js']
    },
    jshint: {
      options: {
        browser: true,
        es5: true // Tolerate the scope when checking for reserved words
      }
    },
    htmllint: {
      all: ["public/**.html"]
    },
    csslint: {
      ui: {
        src: "ui/css/**.css"
      }
    }
  });

  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-html');

  grunt.registerTask( "default", "lint csslint htmllint" );
};

module.exports = function(grunt) {
  grunt.initConfig({
    lint: {
      all: ['grunt.js', 'public/js/*.js', 'server.js', 'lib/**/*.js']
    },
    jshint: {
      options: {
        browser: true,
        es5: true // Tolerate the scope when checking for reserved words
      }
    },
    htmllint: {
      all: ["public/*.html"]
    },
    csslint: {
      base_theme: {
        src: "public/css/**.css"
      }
    }
  });

  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-html');

  grunt.registerTask( "default", "lint csslint htmllint" );
};

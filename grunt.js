module.exports = function(grunt) {
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
    },
    concat: {
      uijs: {
        src: ['ui/js/**.js'],
        dest: 'cljserver/public/js/kod.js'
      },
      uicss: {
        src: ['ui/css/**.css'],
        dest: 'cljserver/public/css/kod.css'
      }
    },
    lint: {
      core: ['grunt.js'],
      ui: ['ui/js/**.js']
    },
    jshint: {
      options: {
        browser: true,
        es5: true // Tolerate the scope when checking for reserved words
      }
    },
    htmllint: {
      all: ["ui/public/**.html"]
    },
    csslint: {
      ui: {
        src: "ui/css/**.css"
      }
    },
    copy: {
      pub: {
        files: {
          "cljserver/public/": "ui/public/**"
        }
      }
    },
    clean: {
      build: ['cljserver/public'],
      jsdoc: ['out']
    },
    compress: {
      tar: {
        options: {
          mode: 'tgz'
        },
        files: {
          "kod.tar.gz": "build/**"
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-html');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask("default", "lint csslint htmllint");
  grunt.registerTask("build", "default clean:build concat copy:pub");
  grunt.registerTask("fastbuild", "concat copy:pub");
  grunt.registerTask("package", "build compress");
};

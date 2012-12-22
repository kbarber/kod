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
        dest: 'build/public/js/kod.js'
      },
      uicss: {
        src: ['ui/css/**.css'],
        dest: 'build/public/css/kod.css'
      },
      serverjs: {
        src: ['server/js/**.js'],
        dest: 'build/server.js'
      }
    },
    lint: {
      core: ['grunt.js'],
      ui: ['ui/js/**.js'],
      server: ['server/js/**.js']
    },
    jshint: {
      options: {
        browser: true,
        es5: true // Tolerate the scope when checking for reserved words
      }
    },
    htmllint: {
      all: ["server/public/**.html"]
    },
    csslint: {
      ui: {
        src: "ui/css/**.css"
      }
    },
    copy: {
      build: {
        files: {
          "build/views/": "server/views/**",
          "build/public/": "server/public/**"
        }
      }
    },
    clean: {
      build: ['build'],
      jsdoc: ['out'],
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
  grunt.registerTask("lint", "lint csslint htmllint");
  grunt.registerTask("build", "default clean:build concat copy:build");
  grunt.registerTask("fastbuild", "concat copy:build");
  grunt.registerTask("package", "build compress");
};

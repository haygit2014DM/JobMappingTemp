'use strict';

module.exports = function (grunt) {
  var mainBowerFiles = require('main-bower-files');
  var _pkg = (function() {
    var ret = grunt.file.readJSON('package.json');
    ret.jsLibFilesInBuild = mainBowerFiles({filter:/.*\.js/ });
    ret.cssLibFilesInBuild = mainBowerFiles({filter:/.*\.css/});

    return ret;
  } )();
  
  var includeGeoIP2 = '<script src="//js.maxmind.com/js/apis/geoip2/v2.1/geoip2.js" type="text/javascript"></script>';
  var redirectScriptContents = grunt.file.read('public/launcher/externalScripts/redirectScript.txt');
  var cdnScriptContents = grunt.file.read('public/launcher/externalScripts/cdnScript.txt');

  var _env_compile = {env: "dev",configIndexReplace: _pkg.configIndexReplace.dev};
  grunt.initConfig({
    pkg: _pkg,
    env_compile:_env_compile,
    notify_hooks: {
      options: {
        enabled: true,
        max_jshint_notifications: 5 // maximum number of notifications from jshint output
      }
    },
    notify: {
      build: {
        options: {
          message: 'Grunt build complete with no errors.'
        }
      },
      js: {
        options: {
          message: 'Passed JSHint & minified without error.'
        }
      },

      less: {
        options: {
          message: 'LESS compiled successfully.'
        }
      },
      deploySuccess: {
        options: {
          message: 'Deploy completed successfully complete.'
        }
      },
      deployError: {
        options: {
          message: 'Deploy has failed!'
        }
      }
    },
    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      debug: {
        options:{

        },
        files: [
          {
            'hgApps/js/hg.jobmapping.js': ['<%= pkg.jsAppFilesInBuild.jobmapping %>','<%= pkg.jsAppFilesInBuild.jobmapping %>']

          }
        ]
      },
      release: {
        options:{

        },
        files: [
          {
            'hgApps/js/hg.jobmapping.js': ['<%= pkg.jsAppFilesInBuild.jobmapping %>','<%= pkg.jsAppFilesInBuild.jobmapping %>']

          }
        ]
      }
    },
    jshint: {
      files: '<%= pkg.jsFilesToWatch %>',
      options: '<%= pkg.jsHintConfig %>'
    },
    // uses grunt-contrib-clean task
    clean: {
      setup: [
        'hgApps/*',
        'releases/<%= env_compile.env %>-*'
      ],
      all:[
        'hgApps',
        'releases'
      ]
    },
    copy: {
      hgApps: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'public',
            src: ['**/*.template.html', 'jobmapping.html', '*2.html'],
            dest: 'hgApps/',
            rename: function(dest, src) {
              return dest + src.replace('.template','');
            }
          },
          {
          expand: true,
          cwd: 'public/jobmapping/data',
          src: ['**'],
          dest: 'hgApps/data'
        },
          {
            expand: true,
            cwd: 'public/jobmapping/css',
            src: ['**'],
            dest: 'hgApps/css'
          },
        {
          expand: true,
          cwd: 'public/launcher/fonts',
          src: ['**'],
          dest: 'hgApps/fonts'
        }, {
          expand: true,
          cwd: 'public/launcher/images',
          src: ['**'],
          dest: 'hgApps/images'
        },
          {
          expand: true,
          cwd: 'public/launcher/media',
          src: ['**'],
          dest: 'hgApps/media'
        }
        ]
      },
      package: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'hgApps',
            src: ['**'],
            dest: 'releases/<%= env_compile.env %>-<%= pkg.version %>/hgApps'

          }
        ]
      }

    },

    less: {
      developmentCss: {
        files: {
          'hgApps/css/app.jobmapping.css': ['<%= pkg.LESS.jobmapping %>']
        },
        options: {
          modifyVars: {
            font: '"<%= env_compile.configIndexReplace.LESS_FONT_PATH %>"'
          },
          sourceMap: true,
          sourceMapFileInline: true,
          sourceMapBasepath: 'public/css/'
          //syncImport: true ///TODO: Check that is needed?
        }
      },
      productionCss: {
        options: {
          compress: true,
          yuicompress: true,
          cleancss: true,
          modifyVars: {
            font: '"<%= env_compile.configIndexReplace.LESS_FONT_PATH %>"'
          }
        },
        files: {
          'hgApps/css/app.jobmapping.css': ['<%= pkg.LESS.jobmapping %>']
        }
      }
    },
    tags: { /// this has to run after "replace"
    
      //JS includes for Configuration
      devJobmappingJS: {
        options: {

          scriptTemplate:'<script type="text/javascript"  src="{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>"></script>',
          openTag: '<!--- Add JS Libs Start -->',
          closeTag: '<!--- Add JS Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.jobmapping.dev %>'],
        dest: 'hgApps/jobmapping.html'
      },
      releaseJobmappingJS: {
        options: {

          scriptTemplate:'<script type="text/javascript"  src="<%= pkg.cdn %><%= env_compile.configIndexReplace.CDN_TAG_PATH %>{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>"></script>',
          openTag: '<!--- Add JS Libs Start -->',
          closeTag: '<!--- Add JS Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.jobmapping.release %>'],
        dest: 'hgApps/jobmapping.html'
      },

      //CSS includes for Configuration
      devJobmappingCSS: {
        options: {

          linkTemplate:'<link href="{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>" rel="stylesheet" type="text/css">',
          openTag: '<!--- Add Css Libs Start -->',
          closeTag: '<!--- Add Css Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.jobmapping.devCss %>'],
        dest: 'hgApps/jobmapping.html'
      },
      releaseJobmappingCSS: {
        options: {

          linkTemplate:'<link href="<%= pkg.cdn %><%= env_compile.configIndexReplace.CDN_TAG_PATH %>{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>" rel="stylesheet" type="text/css">',
          openTag: '<!--- Add Css Libs Start -->',
          closeTag: '<!--- Add Css Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.jobmapping.releaseCss %>'],
        dest: 'hgApps/jobmapping.html'
      },
      
      //script to redirect to CDN version of Configuration html file
      devJobmappingIndexRedirectScript: {
        options: {
          scriptTemplate: '',
          openTag: '<!--- Add JS Redirect Script Start -->',
          closeTag: '<!--- Add JS Redirect Script End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.jobmapping.devRedirectScript %>'],
        dest: 'hgApps/jobmapping.html'
      },
      releaseJobmappingIndexRedirectScript: {
        options: {
          scriptTemplate: '<script type="text/javascript">' + includeGeoIP2 + redirectScriptContents.replace('[[baseFilename]]', 'jobmapping') + '</script>',
          openTag: '<!--- Add JS Redirect Script Start -->',
          closeTag: '<!--- Add JS Redirect Script End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.jobmapping.releaseRedirectScript %>'],   //technically source doesn't matter
        dest: 'hgApps/jobmapping.html'
      },
      
      //script to set the CDN path in Admin
      devJobmappingIndexCDNScript: {
        options: {
          scriptTemplate: '',
          openTag: '<!--- Add CDN Path Start -->',
          closeTag: '<!--- Add CDN Path End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.jobmapping.devCDNScript %>'],
        dest: 'hgApps/jobmapping.html'
      },
      releaseJobmappingIndexCDNScript: {
        options: {
          scriptTemplate: '<script type="text/javascript">' + cdnScriptContents + '</script>',
          openTag: '<!--- Add CDN Path Start -->',
          closeTag: '<!--- Add CDN Path End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.jobmapping.releaseCDNScript %>'],   //technically source doesn't matter
        dest: 'hgApps/jobmapping.html'
      }
    },
    // uses grunt-contrib-uglify task
    uglify: {
      debug: {
        options: {
          sourceMap: true,
          sourceMapIncludeSources: true,
          preserveComments: 'all',
          beautify:true,
          compress:false,
          mangle: false
        },
        files: {
          'hgApps/js/lib.js': ['<%= pkg.jsLibFilesInBuild %>'],
          'hgApps/js/hg.jobmapping.js': ['hgApps/js/hg.jobmapping.js']
        }
      },
      release: {
        options: {
          sourceMap: true,
          mangle: {
            except: ['jQuery']
          }

        },
        files: {
          'hgApps/js/lib.min.js': ['<%= pkg.jsLibFilesInBuild %>'],
          'hgApps/js/hg.jobmapping.js': ['hgApps/js/hg.jobmapping.js']
        }
      }
    },
    //jsbeautifier: {
    //  src: ['<%= pkg.jsFilesToWatch%>'],
    //  options: {
    //    js: '<%= pkg.jsBeautifierConfig %>'
    //  }
    //},
    replace: {

      indexFormat: {
        src: ['<%= env_compile.configIndexReplace.INDEX_FILES_TEMPLATES %>'], // source files array (supports minimatch)
        dest: 'hgApps/', // destination directory or file
        replacements: [{
          from: '{{{CONFIG_DEST_URL_QUERY}}}', // string replacement
          to: '<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>'
        }, {
          from: '{{{BASE_URL}}}', // string replacement
          to: '<%= env_compile.configIndexReplace.DATA_DOMAIN_URL %>'
        }, {
          from: '{{{BASE_ENV}}}', // string replacement
          to: '<%= env_compile.configIndexReplace.ENVIRONMENT %>'
        },{
          from: '{{{TOOGLE_DEPLOY}}}', // string replacement
          to: '<%= env_compile.configIndexReplace.TOOGLE_DEPLOY %>'
        },{
          from: '{{{TEMPATE_MODULE}}}', // string replacement
          to: '<%= env_compile.configIndexReplace.TEMPATE_MODULE %>'
        }
        ]
      }
    },
    html2js: {
      options: {
        base:'../JobMappingTemp/public/',
        watch: true
      },
      jobmapping: {
        src: ['<%= pkg.htmlAppFilesInBuild.jobmapping %>'],
        dest: 'hgApps/templates/jobmapping.tpls.js'
      }

    },
    watch: {
      options: {
        livereload: true
      },
      less: {
        files: ['<%= pkg.lessFilesToWatch %>'],
        tasks: ['less:developmentCss']
      },
      js: {
        files: ['<%= pkg.jsLibFilesInBuild %>','<%= pkg.jsAppFilesInBuild.jobmapping %>'],
        tasks: ['jshint']
      },

      pkg: {
        files: ['package.json'],
        tasks: ['default']
      }
    }

  });

  // Load tasks
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-html-convert');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-script-link-tags');
  //grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-html2js');
  // Register tasks
  grunt.registerTask('default', [
      'setup:dev'

  ]);
  ////////////////////////////////
  /// Private Tasks
  ////////////////////////////////

  /// Clean up the last build then setup hgApps folder.
  grunt.registerTask('startBuild', [
    'checkReadyToGo',
    //'startSetup:dev',
    'clean:setup',
    'copy:hgApps'
  ]);

  // Compile JS and templates that are turned into JS
  grunt.registerTask('compileJsAndTemplates', '', function (env) {

    if(!checkReadyToGo()){
      return false;
    }

    if (env === 'dev' || env === 'devInit') {
      grunt.task.run([
      // HTML Templates to JS
        'html2js:jobmapping',
        // JS build
        //'jshint',
        'ngAnnotate:debug',
        'uglify:debug']);
    }
    else if(env === 'test' || env === 'prod'){
      grunt.task.run([
        // HTML Templates to JS
        'html2js:jobmapping',
        // JS build
        //'jshint',
        'ngAnnotate:release',
        'uglify:release']);
    }
    else{
      grunt.log.error("This environment " + env + " is not supported in compileJsAndTemplates");
      return false;
    }

  });

  // This is the
  grunt.registerTask('compileIndexAndLess', '', function (env) {
    if(!checkReadyToGo()){
      return false;
    }

    if (env === 'dev' || env === 'devInit') {
      grunt.task.run([
        // css
        'less:developmentCss',
        // Compile HTML index files
        'replace:indexFormat',
        'tags:devJobmappingJS',
        'tags:devJobmappingCSS']);
    }
    else if( env === 'prod'){



        grunt.task.run([
          // css
          'less:productionCss',
        // Compile HTML index files
        'replace:indexFormat',
        'tags:releaseJobmappingJS',
        'tags:releaseJobmappingCSS',
          'tags:releaseJobmappingIndexRedirectScript',
          'tags:releaseJobmappingIndexCDNScript'
        ]);


    }
    else if( env === 'test'){

      // We want the min files but we don't want to point to the cloud.
      var _pkgCDN = _pkg.cdn;
      var temp = grunt.config.get("pkg");
      temp.cdn = "";
      grunt.config.set("pkg",temp);
      grunt.log.writeln('Debug: CDN value: ' + grunt.config.get("pkg").cdn);


      grunt.task.run([
        // css
        'less:productionCss',
        // Compile HTML index files
        'replace:indexFormat',
        'tags:releaseJobmappingJS',
        'tags:releaseJobmappingCSS'
      ]);
      //temp.cdn = _pkgCDN;
      //grunt.config.set("pkg",temp);

    }
    else{
      grunt.log.error("This environment " + env + " is not supported in compileIndexAndLess");
      return false;
    }

    grunt.log.writeln('Debug: CDN value: ' + grunt.config.get("pkg").cdn);
  });

  grunt.registerTask('endBuild', [
    'checkReadyToGo',
    // Pack dist file.
    'copy:package'
  ]);

  function checkReadyToGo(){
    if(!_pkg || !_env_compile || !_pkg.randomNumForCacheBusting || !_env_compile.configIndexReplace || !_env_compile.env)
    {
      grunt.log.error('Must run startSetup:env before this step. Example: startSetup:dev ');
      return false;
    }
    return true;
  }
  grunt.registerTask('checkReadyToGo', '', function (env) {
    return checkReadyToGo();
  });

  grunt.registerTask('startSetup', 'Sets up variables for the build.', function (env) {
    _pkg.randomNumForCacheBusting = Math.floor((Math.random() * 10000) + 1);
    _env_compile.configIndexReplace= _pkg.configIndexReplace[env];
    _env_compile.env = env;
  });

  grunt.registerTask('prod', [

  ]);
  grunt.registerTask('test', [
    'tags:specRunnerJS',
    'tags:specRunnerTests'
  ]);

  grunt.registerTask('setup', 'Setup App for Compile and Deployment', function (environment, releaseType) {

    if (!environment) {
      grunt.log.error('No environment specified, available environments: test|dev, prod');
      grunt.log.error('Usage example: grunt package:dev (or prod, test, devInit) ');

      return false;
    }

    grunt.log.writeln('Packaging files...');

    if (environment === 'dev' || environment === 'devInit' || environment === 'test' || environment === 'prod') {
      grunt.task.run(['' +
      'startSetup:'+ environment,
        'startBuild',
        'compileJsAndTemplates:' + environment,
        'compileIndexAndLess:' + environment,
        'endBuild'

      ]);
    }
    else{
      grunt.log.error('This environment is not defined yet: ' + environment);
    }


  });

};

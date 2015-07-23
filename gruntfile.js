'use strict';

module.exports = function (grunt) {
  var mainBowerFiles = require('main-bower-files');
  var _pkg = (function() {
    var ret = grunt.file.readJSON('package.json');
    ret.jsLibFilesInBuild = mainBowerFiles({filter:/.*\.js/ });
    ret.cssLibFilesInBuild = mainBowerFiles({filter:/.*\.css/});

    // TODO: this does not work to get the min files, do I need them?
    //ret.jsLibFilesInBuildRelease = mainBowerFiles({filter:/.*\.min.js/});
    //ret.cssLibFilesInBuildRelease = mainBowerFiles({filter:/.*\.min.css/});


    //var temp = [];
    //ret.jsAppFilesInBuild.all =  temp.concat(ret.jsAppFilesInBuild.admin)
    //    .concat(ret.jsAppFilesInBuild.scribe)
    //    .concat(ret.jsAppFilesInBuild.share);
    //ret.jsAppFilesInBuild.admin = ret.jsAppFilesInBuild.admin.concat(ret.jsAppFilesInBuild.share);
    //ret.jsAppFilesInBuild.scribe = ret.jsAppFilesInBuild.scribe.concat(ret.jsAppFilesInBuild.share);

    return ret;
  } )();
  
  var includeGeoIP2 = '<script src="//js.maxmind.com/js/apis/geoip2/v2.1/geoip2.js" type="text/javascript"></script>';
  var redirectScriptContents = grunt.file.read('public/js/share/externalScripts/redirectScript.txt');
  var cdnScriptContents = grunt.file.read('public/js/share/externalScripts/cdnScript.txt');

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
            //'public/js/lib.min.js': ['<%= pkg.jsLibFilesInBuild %>'],
            'hgApps/js/hg.admin.js': ['<%= pkg.jsAppFilesInBuild.admin %>','<%= pkg.jsAppFilesInBuild.share %>'],
            'hgApps/js/hg.scribe.js': ['<%= pkg.jsAppFilesInBuild.scribe %>','<%= pkg.jsAppFilesInBuild.share %>']

          }
        ]
      },
      release: {
        options:{

        },
        files: [
          {
            //'public/js/lib.min.js': ['<%= pkg.jsLibFilesInBuild %>'],
            'hgApps/js/hg.admin.min.js': ['<%= pkg.jsAppFilesInBuild.admin %>','<%= pkg.jsAppFilesInBuild.share %>'],
            'hgApps/js/hg.scribe.min.js': ['<%= pkg.jsAppFilesInBuild.scribe %>','<%= pkg.jsAppFilesInBuild.share %>']

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
            src: ['**/*.template.html', 'index.html', '*2.html'],
            dest: 'hgApps/',
            rename: function(dest, src) {
              return dest + src.replace('.template','');
            }
          },
          {
          expand: true,
          cwd: 'public/data',
          src: ['**'],
          dest: 'hgApps/data'
        },
          {
            expand: true,
            cwd: 'public/css',
            src: ['**/*.gif', '**/*.png'],
            dest: 'hgApps/css'
          },
        {
          expand: true,
          cwd: 'public/fonts',
          src: ['**'],
          dest: 'hgApps/fonts'
        }, {
          expand: true,
          cwd: 'public/font',
          src: ['**'],
          dest: 'hgApps/font'
        },
          {
          expand: true,
          cwd: 'public/i',
          src: ['**'],
          dest: 'hgApps/i'
        },
        //  {
        //  expand: true,
        //  cwd: 'public/languages',
        //  src: ['**'],
        //  dest: 'hgApps/languages'
        //},
          {
            expand: true,
            cwd: 'public/media',
            src: ['**'],
            dest: 'hgApps/media'
          }
          //,  {
          //  expand: true,
          //  cwd: 'public/templates',
          //  src: ['**'],
          //  dest: 'hgApps/templates'
          //}
        ]
      },
      package: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'hgApps',
            src: ['**'],
            dest: 'releases/<%= env_compile.env %>-<%= pkg.version %>/hgApps',

          },
]
      }

    },
    //sortJSON: {
    //  locales: {
    //    src: ['public-dev/locales/*-master.json']
    //  }
    //},
    // uses grunt-contrib-less task
    less: {
      developmentCss: {
        files: {
          'hgApps/css/app.scribe.css': ['<%= pkg.LESS.scribe %>'],
          'hgApps/css/app.admin.css': ['<%= pkg.LESS.admin %>'],
          'hgApps/css/lib.css': ['<%= pkg.cssLibFilesInBuild %>'],
          'hgApps/css/ipad.css': ['public/css/scribe/ipad.less']
        },
        options: {
          modifyVars: {
            font: '"<%= env_compile.configIndexReplace.LESS_FONT_PATH %>"'
          },
          sourceMap: true,
          sourceMapFileInline: true,
          sourceMapBasepath: 'public/css/',
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
          'hgApps/css/app.scribe.min.css': ['<%= pkg.LESS.scribe %>'],
          'hgApps/css/app.admin.min.css': ['<%= pkg.LESS.admin %>'],
          'hgApps/css/lib.min.css': ['<%= pkg.cssLibFilesInBuild %>'],
          'hgApps/css/ipad.css': ['public/css/scribe/ipad.less']
        }
      }
    },
    tags: { /// this has to run after "replace"
    
      //JS includes for Configuration
      devAdminJS: {
        options: {

          scriptTemplate:'<script type="text/javascript"  src="{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>"></script>',
          openTag: '<!--- Add JS Libs Start -->',
          closeTag: '<!--- Add JS Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.admin.dev %>'],
        dest: 'hgApps/configuration.html'
      },
      releaseAdminJS: {
        options: {

          scriptTemplate:'<script type="text/javascript"  src="<%= pkg.cdn %><%= env_compile.configIndexReplace.CDN_TAG_PATH %>{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>"></script>',
          openTag: '<!--- Add JS Libs Start -->',
          closeTag: '<!--- Add JS Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.admin.release %>'],
        dest: 'hgApps/configuration.html'
      },

      //CSS includes for Configuration
      devAdminCSS: {
        options: {

          linkTemplate:'<link href="{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>" rel="stylesheet" type="text/css">',
          openTag: '<!--- Add Css Libs Start -->',
          closeTag: '<!--- Add Css Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.admin.devCss %>'],
        dest: 'hgApps/configuration.html'
      },
      releaseAdminCSS: {
        options: {

          linkTemplate:'<link href="<%= pkg.cdn %><%= env_compile.configIndexReplace.CDN_TAG_PATH %>{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>" rel="stylesheet" type="text/css">',
          openTag: '<!--- Add Css Libs Start -->',
          closeTag: '<!--- Add Css Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.admin.releaseCss %>'],
        dest: 'hgApps/configuration.html'
      },
      
      //JS includes for Scribe
      devScribeJS: {
        options: {

          scriptTemplate:'<script type="text/javascript"  src="{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>"></script>',
          openTag: '<!--- Add JS Libs Start -->',
          closeTag: '<!--- Add JS Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.scribe.dev %>'],
        dest: 'hgApps/jobdescription.html'
      },
      releaseScribeJS: {
        options: {

          scriptTemplate:'<script type="text/javascript"  src="<%= pkg.cdn %><%= env_compile.configIndexReplace.CDN_TAG_PATH %>{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>"></script>',
          openTag: '<!--- Add JS Libs Start -->',
          closeTag: '<!--- Add JS Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.scribe.release %>'],
        dest: 'hgApps/jobdescription.html'
      },

      //CSS includes for Scribe
      devScribeCSS: {
        options: {

          linkTemplate:'<link href="{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>" rel="stylesheet" type="text/css">',
          openTag: '<!--- Add Css Libs Start -->',
          closeTag: '<!--- Add Css Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.scribe.devCss %>'],
        dest: 'hgApps/jobdescription.html'
      },
      releaseScribeCSS: {
        options: {

          linkTemplate:'<link href="<%= pkg.cdn %><%= env_compile.configIndexReplace.CDN_TAG_PATH %>{{ path }}?_=<%= pkg.version %>-<%= pkg.randomNumForCacheBusting %>" rel="stylesheet" type="text/css">',
          openTag: '<!--- Add Css Libs Start -->',
          closeTag: '<!--- Add Css Libs End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.scribe.releaseCss %>'],
        dest: 'hgApps/jobdescription.html'
      },
      
      //script to redirect to CDN version of Configuration html file
      devAdminIndexRedirectScript: {
        options: {
          scriptTemplate: '',
          openTag: '<!--- Add JS Redirect Script Start -->',
          closeTag: '<!--- Add JS Redirect Script End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.admin.devRedirectScript %>'],
        dest: 'hgApps/configuration.html'
      },
      releaseAdminIndexRedirectScript: {
        options: {
          scriptTemplate: '<script type="text/javascript">' + includeGeoIP2 + redirectScriptContents.replace('[[baseFilename]]', 'configuration') + '</script>',
          openTag: '<!--- Add JS Redirect Script Start -->',
          closeTag: '<!--- Add JS Redirect Script End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.admin.releaseRedirectScript %>'],   //technically source doesn't matter
        dest: 'hgApps/configuration.html'
      },
      
      //script to redirect to CDN version of Scribe html file
      devScribeIndexRedirectScript: {
        options: {
          scriptTemplate: '',
          openTag: '<!--- Add JS Redirect Script Start -->',
          closeTag: '<!--- Add JS Redirect Script End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.scribe.devRedirectScript %>'],
        dest: 'hgApps/jobdescription.html'
      },
      releaseScribeIndexRedirectScript: {
        options: {
          scriptTemplate: '<script type="text/javascript">' + includeGeoIP2 + redirectScriptContents.replace('{{baseFilename}}', 'jobdescription') + '</script>',
          openTag: '<!--- Add JS Redirect Script Start -->',
          closeTag: '<!--- Add JS Redirect Script End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.scribe.releaseRedirectScript %>'],   //technically source doesn't matter
        dest: 'hgApps/jobdescription.html'
      },
      
      //script to set the CDN path in Admin
      devAdminIndexCDNScript: {
        options: {
          scriptTemplate: '',
          openTag: '<!--- Add CDN Path Start -->',
          closeTag: '<!--- Add CDN Path End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.admin.devCDNScript %>'],
        dest: 'hgApps/configuration.html'
      },
      releaseAdminIndexCDNScript: {
        options: {
          scriptTemplate: '<script type="text/javascript">' + cdnScriptContents + '</script>',
          openTag: '<!--- Add CDN Path Start -->',
          closeTag: '<!--- Add CDN Path End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.admin.releaseCDNScript %>'],   //technically source doesn't matter
        dest: 'hgApps/configuration.html'
      },
      
      //script to set the CDN path in Scribe
      devScribeIndexCDNScript: {
        options: {
          scriptTemplate: '',
          openTag: '<!--- Add CDN Path Start -->',
          closeTag: '<!--- Add CDN Path End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.scribe.devCDNScript %>'],
        dest: 'hgApps/jobdescription.html'
      },
      releaseScribeIndexCDNScript: {
        options: {
          scriptTemplate: '<script type="text/javascript">' + cdnScriptContents + '</script>',
          openTag: '<!--- Add CDN Path Start -->',
          closeTag: '<!--- Add CDN Path End -->'
        },
        src: ['<%= pkg.jsCDNFilesInBuild.scribe.releaseCDNScript %>'],   //technically source doesn't matter
        dest: 'hgApps/jobdescription.html'
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
          'hgApps/js/hg.admin.js': ['hgApps/js/hg.admin.js'],
          'hgApps/js/hg.scribe.js': ['hgApps/js/hg.scribe.js']
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
          'hgApps/js/hg.admin.min.js': ['hgApps/js/hg.admin.min.js'],
          'hgApps/js/hg.scribe.min.js': ['hgApps/js/hg.scribe.min.js']
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
        base:'../activate-admin/public/',
        watch: true
      },
      scribe: {
        src: ['<%= pkg.htmlAppFilesInBuild.scribe %>'],
        dest: 'hgApps/templates/scribe.tpls.js'
      },
      admin: {
        src: ['<%= pkg.htmlAppFilesInBuild.admin %>'],
        dest: 'hgApps/templates/admin.tpls.js'
      }
      //scribeRelease: {
      //  src: ['<%= pkg.htmlAppFilesInBuild.scribe %>'],
      //  dest: 'hgApps/templates/scribe.tpls.js'
      //},
      //adminRelease: {
      //  src: ['<%= pkg.htmlAppFilesInBuild.admin %>'],
      //  dest: 'hgApps/templates/admin.tpls.js'
      //}
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
        files: ['<%= pkg.jsLibFilesInBuild %>','<%= pkg.jsAppFilesInBuild.admin %>','<%= pkg.jsAppFilesInBuild.share %>','<%= pkg.jsAppFilesInBuild.scribe %>',],
        tasks: ['jshint']
      },

      pkg: {
        files: ['package.json'],
        tasks: ['default']
      }
    },
    /**
     * FOR USAGE:
     * See Build & Release Process docs in wiki.
     * This uses environment variables. These aren't placeholder values!
     */
    //release: {
    //  options: {
    //    npm: false,
    //    github: {
    //      repo: 'HayGroup/hay-101a',
    //      usernameVar: 'GITHUB_USERNAME',
    //      passwordVar: 'GITHUB_PASSWORD'
    //    }
    //  }
    //},
    //shell: {
    //  prodRelease: {
    //    options: {
    //      stdout: true
    //    },
    //    command: ['cp -r ./public-prod ./releases/prod-<%= pkg.version %>'].join('&&')
    //  },
    //  testRelease: {
    //    options: {
    //      stdout: true
    //    },
    //    command: ['cp -r ./public-dev ./releases/test-<%= pkg.version %>',
    //      'rm -rf ./releases/test-<%= pkg.version %>/templates/*/'
    //    ].join('&&')
    //  },
    //  stagingRelease: {
    //    options: {
    //      stdout: true
    //    },
    //    command: ['cp -r ./public-dev ./releases/staging-<%= pkg.version %>',
    //      'rm -rf ./releases/staging-<%= pkg.version %>/templates/*/'
    //    ].join('&&')
    //  },
    //  devRelease: {
    //    options: {
    //      stdout: true
    //    },
    //    command: ['cp -r ./public-dev ./releases/dev-<%= pkg.version %>',
    //      'rm -rf ./releases/dev-<%= pkg.version %>/templates/*/'
    //    ].join('&&')
    //
    //  }
    //}
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
    //  //'startSetup:dev',
    //  'clean:setup',
    //  'copy:hgApps',
    //  // css
    //'less:developmentCss',
    //// HTML Templates to JS
    // 'html2js:scribe',
    // 'html2js:admin',
    //  // JS build
    //'ngAnnotate:debug',
    //'uglify:debug',
    //// Compile HTML index files
    //'replace:indexFormat',
    //'tags:devAdminJS',
    //'tags:devAdminCSS',
    //'tags:devScribeJS',
    //'tags:devScribeCSS',
    ////'tags:releaseAdminIndexRedirectScript',       ////////////TODO: remove
    //  // Pack dist file.
    //  'copy:package'
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
        'html2js:scribe',
        'html2js:admin',
        // JS build
        //'jshint',
        'ngAnnotate:debug',
        'uglify:debug']);
    }
    else if(env === 'test' || env === 'prod'){
      grunt.task.run([
        // HTML Templates to JS
        'html2js:scribe',
        'html2js:admin',
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
        'tags:devAdminJS',
        'tags:devAdminCSS',
        'tags:devScribeJS',
        'tags:devScribeCSS']);
    }
    else if( env === 'prod'){



        grunt.task.run([
          // css
          'less:productionCss',
        // Compile HTML index files
        'replace:indexFormat',
        'tags:releaseAdminJS',
        'tags:releaseAdminCSS',
        'tags:releaseScribeJS',
        'tags:releaseScribeCSS',
          'tags:releaseAdminIndexRedirectScript',
          'tags:releaseScribeIndexRedirectScript',
          'tags:releaseAdminIndexCDNScript'
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
        'tags:releaseAdminJS',
        'tags:releaseAdminCSS',
        'tags:releaseScribeJS',
        'tags:releaseScribeCSS'
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
  /**
   * GRUNT PACKAGE
   * This setup the different settinging for each environment so that the build is correct.
   *
   */



  grunt.registerTask('prod', [

  ]);
  grunt.registerTask('test', [
    'tags:specRunnerJS',
    'tags:specRunnerTests'
  ]);

  /**
   * GRUNT PACKAGE
   * Used to create packaged dev, test, staging & prod folders
   * for deployment to dev, test and/or production.
   *
   */
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

      ])
    }
    else{
      grunt.log.error('This environment is not defined yet: ' + environment);
    }




    //else if (environment === 'test') {
    //  grunt.task.run(['startSetup:test', 'default']);
    //} else if (environment === 'proxy') {
    //  grunt.task.run(['startSetup:proxy','default']);
    //}
    //
    //// TODO: Do these yet.
    //else if (environment === 'staging') {
    //  grunt.task.run(['default', 'shell:stagingRelease']);
    //} else if (environment === 'prod') {
    //  grunt.task.run(['prod', 'shell:prodRelease']);
    //} else {
    //  grunt.log.error('Unknown environment specified.');
    //}
  });

};

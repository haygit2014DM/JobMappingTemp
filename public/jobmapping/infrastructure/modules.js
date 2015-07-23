'use strict';

angular.module('hg', [ 'ngRoute',
                       'pascalprecht.translate',
                       'hg.jobMapping', window.TEMPLATES_MODULE_NAME
                     ]);

//jobMapping modules
angular.module('hg.jobMapping', ['hg.jobMapping.services',
                             'hg.jobMapping.directives',
                             'hg.jobMapping.controllers', window.TEMPLATES_MODULE_NAME]);

angular.module('hg.jobMapping.services', ['ngRoute']);
angular.module('hg.jobMapping.controllers', [window.TEMPLATES_MODULE_NAME]);
angular.module('hg.jobMapping.directives', ['ui.bootstrap', 'ui.select2', 'ui.bootstrap-slider', window.TEMPLATES_MODULE_NAME]);

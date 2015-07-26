'use strict';

angular.module('hg', ['hg.jobMapping.controller']);
angular.module('hg.jobMapping', []);

//jobMapping modules
angular.module('hg.jobMapping', ['hg.jobMapping.services',
                             'hg.jobMapping.directives',
                             'hg.jobMapping.controller', window.TEMPLATES_MODULE_NAME]);

angular.module('hg.jobMapping.services', ['ngRoute']);
angular.module('hg.jobMapping.controller', [window.TEMPLATES_MODULE_NAME]);
angular.module('hg.jobMapping.directives', ['ui.bootstrap', 'ui.select2', 'ui.bootstrap-slider', window.TEMPLATES_MODULE_NAME]);

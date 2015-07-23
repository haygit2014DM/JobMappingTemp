
function create(moduleName){
  angular.module(moduleName)
  .service('$popup', ['$rootScope', '$modal', '$http', '$q', '$filter',
    function($rootScope, $modal, $http, $q, $filter){
      var $popup = {};
      var pathToHtmls = 'templates/share';

      $popup.alert = function(labelText, titleText, okText, labelTextParams){
        var alertModal = $modal.open({
          templateUrl: pathToHtmls + '/generic.alert.html',
          controller: 'GenericAlertCtrl',
          backdrop: 'static',
          keyboard: false,
          resolve: {
            text: function(){
              return {
                title: titleText || 'Alert',
                label: labelText,
                ok: okText || 'OK',
                labelParams: labelTextParams
              };
            }
          }
        });
        return alertModal.result;
      };
      $popup.confirm = function(labelText, titleText, yesText, noText, labelTextParams){
        var confirmModal = $modal.open({
          templateUrl: pathToHtmls + '/generic.confirmation.html',
          controller: 'GenericConfirmationCtrl',
          backdrop: 'static',
          keyboard: false,
          resolve: {
            text: function(){
              return {
                title: titleText || 'Confirmation',
                label: labelText,
                yes: yesText || 'Yes',
                no: noText || 'No',
                labelParams: labelTextParams
              };
            }
          }
        });
        return confirmModal.result;
      };
      $popup.input = function(labelText, titleText, okText, labelTextParams){
        var inputModal = $modal.open({
          templateUrl: pathToHtmls + '/generic.input.html',
          controller: 'GenericInputCtrl',
          backdrop: 'static',
          keyboard: false,
          resolve: {
            text: function(){
              return {
                title: titleText || 'Input',
                label: labelText,
                ok: okText || 'OK',
                labelParams: labelTextParams
              };
            }
          }
        });
        return inputModal.result;
      };
      $popup.bullets = function(labelText, titleText, okText, bulletStaticStrings, labelTextParams){
        var bulletsAsObjects = [];
        _.each(bulletStaticStrings, function(b){ bulletsAsObjects.push({text: b}); });
        var inputModal = $modal.open({
          templateUrl: pathToHtmls + '/generic.bullets.html',
          controller: 'GenericBulletCtrl',
          backdrop: 'static',
          keyboard: false,
          resolve: {
            text: function(){
              return {
                title: titleText,
                label: labelText,
                ok: okText || 'OK',
                labelParams: labelTextParams
              };
            },
            bullets: function(){
              return bulletsAsObjects;
            }
          }
        });
        return inputModal.result;
      };
      $popup.select = function(array, keyName, displayFunc, submitFunc, titleText, submitText, cancelText, placeholderText){
        var selectModal = $modal.open({
          templateUrl: pathToHtmls + '/generic.selector.html',
          controller: 'GenericSelectorCtrl',
          backdrop: 'static',
          keyboard: false,
          resolve: {
            text: function(){ return {
              submit: submitText || 'OK',
              cancel: cancelText || 'Cancel',
              title: titleText || 'Select',
              placeholder: placeholderText
            };},
            displayFunc: function(){ return (displayFunc || function(item){ return ''; }); },
            entryList: function(){   return array; },
            keyName: function(){     return keyName; },
            submitFunc: function(){  return submitFunc; }   //Takes in the selected val. Should return a val for the window to close with,
          }                                                 //... or a deferred object that will return that val
        });
        return selectModal.result;
      };
      $popup.include = function(conflicts, displayEntryFunc, displayCurrentSettingFunc, submitFunc, labelText, titleText, actionText,
          entryText, currentText, includeText, excludeText, submitText, cancelText, windowClass){
        var includeModal = $modal.open({
          templateUrl: pathToHtmls + '/generic.include.html',
          controller: 'GenericIncludeCtrl',
          backdrop: 'static',
          keyboard: false,
          windowClass: windowClass,
          resolve: {
            text: function(){ return {
              submit: submitText || 'OK',
              cancel: cancelText || 'Cancel',
              title: titleText || 'Include / Exclude',
              label: labelText,
              action: actionText,
              entry: entryText === '' ? '' : (entryText || 'Entry'),
              current: currentText === '' ? '' : (currentText || 'Current Setting'),
              exclude: excludeText || 'Exclude',
              include: includeText || 'Include'
            };},
            conflicts: function(){                 return conflicts; },
            displayEntryFunc: function(){          return (displayEntryFunc || function(item){ return ''; }); },
            displayCurrentSettingFunc: function(){ return (displayCurrentSettingFunc || function(item){ return ''; }); },
            submitFunc: function(){                return submitFunc; }    //Takes in the selected and unselected entries. Should return a val for the
          }                                                                //... window to close with, or a deferred object that will return that val
        });
        return includeModal.result;
      };
      $popup.form = function(htmlPath, replacementDictionary, titleText, submitText, postUrl, responseFunc){
        $http.get(htmlPath).success(function(innerHtml){
          $http.get(pathToHtmls + '/generic.form.form.html').success(function(formHtml){
            //if(bUsePHP){
              //formHtml = utilService.replace(formHtml, '@Action', 'generic.form.upload.php');
            formHtml = utilService.replace(formHtml, '@Action', postUrl);
            //}
            //else{
            //  formHtml = utilService.replace(formHtml, '@Action', postUrl);
            //}
            formHtml = utilService.replace(formHtml, '@SubmitText', submitText);
            
            if(replacementDictionary){
              for(var prop in replacementDictionary){
                innerHtml = utilService.replace(innerHtml, prop, replacementDictionary[prop]);
              }
            }
            formHtml = utilService.replace(formHtml, '@InnerHtml', innerHtml);
            
            var formModal = $modal.open({
              templateUrl: pathToHtmls + '/generic.form.html',
              controller: 'GenericFormCtrl',
              resolve: {
                formHtml: function(){ return formHtml; },
                responseFunc: function(){ return responseFunc; },
                text: function(){ return {
                  title: titleText
                };}
              }
            });
          });
        });
      };
      
      return $popup;
    }
  ]);
}
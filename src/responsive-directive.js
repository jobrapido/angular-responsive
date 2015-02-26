(function(angular) {
  'use strict';

  angular
    .module('angular-responsive', [])
    .provider('responsiveHelper', ['$windowProvider', function($windowProvider) {

      var $window = $windowProvider.$get();
      var winWidth = $window.innerWidth || $window.outerWidth;
      var helper = {
        isTouch: function() {
          return ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
        },
        isNotTouch: function() {
          return !this.isTouch();
        },
        isSmall: function() {
          return winWidth < 768;
        },
        isMedium: function() {
          return winWidth >= 768 && winWidth <= 1024;
        },
        isLarge: function() {
          return winWidth > 1024;
        }
      };

      // Publish accessor function...

      this.$get = function() {
        return helper;
      };
    }])
  /**
   * Touch screens (independent from screen size)
   */
  .directive('jrResponsiveTouch', ['responsiveHelper', function(responsiveHelper) {
    return {
      restrict: 'EAC',
      transclude: 'element',
      template: '<div></div>',
      compile: buildCompileFn('jrResponsiveTouch', responsiveHelper.isTouch)
    };
  }])

  /**
   * Non-touch screens (independent from screen size)
   */
   .directive('jrResponsiveNotTouch', ['responsiveHelper', function(responsiveHelper) {
     return {
       restrict: 'EAC',
       transclude: 'element',
       template: '<div></div>',
       compile: buildCompileFn('jrResponsiveNotTouch', responsiveHelper.isNotTouch)
     };
   }])

  /**
   * Small screens (<768px)
   */
  .directive('jrResponsiveSmall', ['responsiveHelper', function(responsiveHelper) {
    return {
      restrict: 'EAC',
      transclude: 'element',
      template: '<div></div>',
      compile: buildCompileFn('jrResponsiveSmall', responsiveHelper.isSmall)
    };
  }])

  /**
   * Medium screens (≥768px)
   */
  .directive('jrResponsiveMedium', ['responsiveHelper', function(responsiveHelper) {
    return {
      restrict: 'EAC',
      transclude: 'element',
      template: '<div></div>',
      compile: buildCompileFn('jrResponsiveMedium', responsiveHelper.isMedium)
    };
  }])

  /**
   * Large screens (>1024px)
   */
  .directive('jrResponsiveLarge', ['responsiveHelper', function(responsiveHelper) {
    return {
      restrict: 'EAC',
      transclude: 'element',
      template: '<div></div>',
      compile: buildCompileFn('jrResponsiveLarge', responsiveHelper.isLarge)
    };
  }])

  /**
   * Does the with a match user-specified combination (0..4)
   */
  .directive('jrResponsive', ['responsiveHelper', function(responsiveHelper) {
    return {
      restrict: 'EAC',
      transclude: 'element',
      template: '<div></div>',
      compile: buildCompileFn('jrResponsive', checkAllTypes(responsiveHelper))
    };
  }]);

  /**
   * Partial application for DRY construction of a directive compile function
   */
  function buildCompileFn(responsiveType, verifyFn) {
    return function compile(element, attr, transclude) {
      return function postLink(scope, element, attr) {
        var childElement, childScope,
          config = scope.$eval(attr[responsiveType]),
          unwatch = scope.$watch(config, function() {
            // attribute changed, delete existing element & $scope

            if (childElement) {
              childElement.remove();
              childScope.$destroy();
              childElement = undefined;
              childScope = undefined;
            }

            if (verifyFn(config)) {
              // Create a new element and $scope...

              childScope = scope.$new();
              childElement = transclude(childScope, function(clone) {
                element.after(clone);
              });
            }
          });

        // Fix memory leak an remove watcher when element/directive is released

        scope.$on("$destroy", unwatch);
      };
    };
  }

  function checkAllTypes(responsiveHelper) {
    return function(deviceTypes) {
      return (deviceTypes['small'] && responsiveHelper.isSmall()) ||
        (deviceTypes['medium'] && responsiveHelper.isMedium()) ||
        (deviceTypes['large'] && responsiveHelper.isLarge()) || false;
    };
  }

})(window.angular);

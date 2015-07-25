(function () {
  'use strict';

  angular.module('ml.common')
  .service('ModalService', ['$modal', '$sce', ModalService]);

  function ModalService($modal, $sce) {

    var service = {
      show: showModal
    };

    return service;

    function showModal(template, title, model, validate, modalOptions) {
      return $modal.open(
        angular.extend({
          templateUrl: template+'',
          controller: function ($scope, $modalInstance, title, model, validate) {
            $scope.title = title;
            $scope.model = model;
            $scope.alerts = [];
            $scope.ok = function () {
              if (validate) {
                $scope.alerts = validate($scope.model);
              }
              if ($scope.alerts.length === 0) {
                $modalInstance.close($scope.model);
              }
            };
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.encodeURIComponent = encodeURIComponent;
            $scope.trustUrl = $sce.trustAsResourceUrl;
          },
          size: 'lg',
          resolve: {
            title: function () {
              return title;
            },
            model: function () {
              return model;
            },
            validate: function () {
              return validate;
            }
          }
        }, modalOptions)
      ).result;
    }
  }
}());

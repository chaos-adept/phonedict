'use strict';

/* Controllers */

angular.module('phoneDictApp.controllers', [])
    .controller('DictController', ['$scope', '$http', '$modal', '$q', function ($scope, $http, $modal, $q) {

        var RELOAD_FIRST_PAGE_TIME = 600;
        var CONFLICT_STATUS = 409;
        var PHONE_NUMBER_PATTERN =
            /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/;

        $scope.pageNum = 0;
        $scope.pageSize = 50;

        $scope.items = [];

        $scope.editRequest = function (item) {


            var modalScope = $scope.$new(true);
            var originValues = { name: item.name, phoneNumber: item.phoneNumber };
            modalScope.item = angular.copy(originValues);
            modalScope.phonePattern = PHONE_NUMBER_PATTERN;
            modalScope.isUnchanged = function (currentValues) {
                return angular.equals(currentValues, originValues);
            };
            modalScope.requestClosing = function (editedFields, closeHandler) {
                $scope.save(item, editedFields).then(function () {
                    closeHandler();
                });
            };

            $modal.open({
                templateUrl: 'partial/contact-modal-dialog.html',
                controller: function ($scope, $modalInstance) {
                    $scope.ok = function () {
                        $scope.requestClosing($scope.item, $modalInstance.close);
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                scope: modalScope
            });
        };

        $scope.remove = function (item) {
            $http.delete(item._links.self.href).success(function () {
                $scope.items.splice($scope.items.indexOf(item), 1);
            })
            .error($scope.showGenericPersistContactError);
        };

        $scope.save = function (item, changedFields) {
            var deferred = $q.defer();
            if (item._links) {
                $http({method: 'PATCH', url: item._links.self.href, data: changedFields}).success(function () {
                    $.extend(item, changedFields);
                    deferred.resolve();
                })
                .error(function (data, status, headers) {
                    deferred.reject();
                    $scope.showGenericPersistContactError.apply($scope, arguments);
                });
            } else {
                $http.post('/contacts', changedFields).success(function (data, status, headers) {
                    var selfLink = headers("location");
                    changedFields._links = { self: { href: selfLink } };
                    $scope.items.push(changedFields);
                    deferred.resolve();
                })
                .error(function (data, status, headers) {
                    deferred.reject();
                    $scope.showGenericPersistContactError.apply($scope, arguments);
                });
            }

            return deferred.promise;
        };

        $scope.reLoadFirstPage = function () {
            $scope.items = [];
            $scope.isLoadingPage = true;

            var successHandler = function (data) {
                $scope.pageNum = 0;
                $scope.totalPages = data.page.totalPages;
                $scope.items = data._embedded ? data._embedded.contacts : [];
                $scope.nextPageHref = data._links.next ? data._links.next.href : undefined;
                $scope.isLoadingPage = false;
            };

            if ($scope.query) {
                $http.get('/contacts/search/findWithPartOfName', {params:{name: $scope.query, page: $scope.pageNum, size: $scope.pageSize}}).success(successHandler);
            } else {
                $http.get('/contacts', {params: {page: $scope.pageNum, size: $scope.pageSize}}).success(successHandler);
            }

        };

        $scope.nextPage = function () {
            if (!$scope.nextPageHref) {
                return;
            }
            if ($scope.isLoadingPage) {
                return;
            }

            $scope.isLoadingPage = true;
            $http.get($scope.nextPageHref).success(function (data) {
                $scope.totalPages = data.page.totalPages;
                $scope.nextPageHref = data._links.next ? data._links.next.href : undefined;
                angular.forEach(data._embedded.contacts, function (item) {
                    $scope.items.push(item);
                });
                $scope.isLoadingPage = false;
            });
        };

        $scope.showGenericPersistContactError = function (data, status) {
            if (status == CONFLICT_STATUS) {
                alert('There is another user with same name and phone number. Please re-check your values.');
            } else {
                var rawMsgPart = "Error. HTTP Status:'" + status + "', error data: " + JSON.stringify(data);
                alert(rawMsgPart);
            }

        };

        $scope.debounceReLoadFirstPage = _.debounce($scope.reLoadFirstPage, RELOAD_FIRST_PAGE_TIME);
        $scope.debounceReLoadFirstPage();

    }]);
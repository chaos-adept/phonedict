'use strict';

angular.module('phoneDictApp.directives', [])
    .directive('contactItem', function() {
        return {
            restrict: 'EA',
            scope: {
                data: '=data',
                highlightText: '=highlightText',
                onUpdate: '&onUpdate',
                onRemove: '&onRemove'
            },
            templateUrl: 'partial/contact-item.html',
            link: function (scope, element) {
                scope.toEditState = function () {
                    scope.onUpdate();
                };
                scope.cancelEdit = function () {
                    scope.editMode = false;
                }
            }
        };
    })
    .directive('autoFocus', function($timeout) {
        return {
            restrict: 'AC',
            link: function(_scope, _element) {
                $timeout(function(){
                    _element[0].focus();
                }, 0);
            }
        };
    });;
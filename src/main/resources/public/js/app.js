'use strict';


// Declare app level module which depends on filters, and services
angular.module('phoneDictApp', [
        'ngSanitize',
        'ui.utils',
        'ui.bootstrap',
        'infinite-scroll',
        'phoneDictApp.controllers',
        'phoneDictApp.services',
        'phoneDictApp.directives'
    ]);
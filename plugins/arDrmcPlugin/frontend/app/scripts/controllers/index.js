(function () {

  'use strict';

  var angular = require('angular');

  module.exports = angular.module('momaApp.controllers', [])

    .controller('DashboardCtrl', require('./DashboardCtrl'))
    .controller('AIPBrowserCtrl', require('./AIPBrowserCtrl'))
    .controller('AIPReclassifyCtrl', require('./AIPReclassifyCtrl'))
    .controller('AIPViewCtrl', require('./AIPViewCtrl'))
    .controller('WorkBrowserCtrl', require('./WorkBrowserCtrl'))
    .controller('WorkViewCtrl', require('./WorkViewCtrl'))
    .controller('TechnologyRecordBrowserCtrl', require('./TechnologyRecordBrowserCtrl'))
    .controller('TechnologyRecordViewCtrl', require('./TechnologyRecordViewCtrl'))

    .controller('ArtworkRecordCtrl', require('./ArtworkRecordCtrl'))
    .controller('ArtworkRecord2Ctrl', require('./ArtworkRecord2Ctrl'));
    /*.controller('TechnologyRecordCtrl', require('./TechnologyRecordCtrl'));*/

})();

var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope, $http, $window) {
  function getQueryParams() {
    const params = {};
    location.search
      .substr(1)
      .split("&")
      .forEach(function (item) {
        const [key, value] = item.split("=");
        if (key) params[key.toLowerCase()] = decodeURIComponent(value || "");
      });
    return params;
  }

  function applyGradeName(classNumber, yearId, currentAcYearId) {
    $scope.GradeName = "Class/Grade";
    if (classNumber == null || classNumber === undefined || classNumber === "") {
      return;
    }
    let n = Number(classNumber);
    if (!isFinite(n)) {
      return;
    }
    const yearDiff = (yearId || 0) - (currentAcYearId || 0);
    n = n + yearDiff;
    if (n == 0) {
      n = 1;
    }
    if (n > 0) {
      $scope.GradeName = "Class " + n;
    } else if (n == -1) {
      $scope.GradeName = "UKG";
    } else if (n == -2) {
      $scope.GradeName = "LKG";
    } else if (n == -3) {
      $scope.GradeName = "NURSERY";
    }
  }

  function applyAdmissionInfo(data, classNumber) {
    $scope.admInfo = data || {};
    if (!$scope.admInfo.AadharNumber) {
      $scope.admInfo.AadharNumber = "";
    }

    $scope.gender =
      $scope.admInfo.GenderId == 501
        ? "Male"
        : $scope.admInfo.GenderId == 502
          ? "Female"
          : "";

    if ($scope.admInfo.DateOfBirth) {
      $scope.admInfo.DateOfBirth = new Date($scope.admInfo.DateOfBirth);
    }
    if ($scope.admInfo.CreatedDate) {
      $scope.admInfo.CreatedDate = new Date($scope.admInfo.CreatedDate);
    }

    $scope.YearName =
      $scope.admInfo.YearId == 9
        ? "2026-27"
        : $scope.admInfo.YearId == 10
          ? "2027-28"
          : "2025-26";

    applyGradeName(
      classNumber,
      $scope.admInfo.YearId,
      $scope.orgInfo && $scope.orgInfo.CurrentAcYearId
    );
  }

  $scope.gender = "";
  $scope.admInfo = { AadharNumber: "" };
  $scope.orgInfo = {};
  $scope.GradeName = "";
  $scope.YearName = "";
  $scope.errorMessage = "";

  if (typeof ReportShare === "undefined" || !ReportShare.hasToken()) {
    $scope.errorMessage = "Open this admission form from the School Vertex app.";
    return;
  }

  ReportShare.loadAdmission($http)
    .then(function (data) {
      $scope.orgInfo = data.orgInfo || {};
      applyAdmissionInfo(data.admInfo, data.classNumber);
      $scope.$applyAsync();
    })
    .catch(function (err) {
      $scope.errorMessage =
        (err && err.message) || "Unable to load admission form.";
      $scope.$applyAsync();
    });
});

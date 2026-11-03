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

  function applyAdmissionInfo(data) {
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

    $scope.GradeName = "Class/Grade";
    if (!$scope.admInfo.BatchId) {
      return;
    }

    const classInfoUrl =
      `${baseUrl}/Batch/GetClassNumber/${$scope.admInfo.BatchId}`;
    $http.get(classInfoUrl).then(function (resp) {
      let classNumber = resp.data;
      const yearDiff =
        ($scope.admInfo.YearId || 0) - ($scope.orgInfo.CurrentAcYearId || 0);
      classNumber = classNumber + yearDiff;
      if (classNumber == 0) {
        classNumber = 1;
      }
      if (classNumber > 0) {
        $scope.GradeName = "Class " + classNumber;
      } else if (classNumber == -1) {
        $scope.GradeName = "UKG";
      } else if (classNumber == -2) {
        $scope.GradeName = "LKG";
      } else if (classNumber == -3) {
        $scope.GradeName = "NURSERY";
      }
    });
  }

  const baseUrl = SvApi.apiBase();
  const query = getQueryParams();
  const admId = query.id;
  const userId = query.userid || query.userId;
  const orgId = query.orgid || query.orgId;

  $scope.gender = "";
  $scope.admInfo = { AadharNumber: "" };
  $scope.GradeName = "";
  $scope.YearName = "";

  if (!orgId || (!admId && !userId)) {
    return;
  }

  const orgInfoUrl = `${baseUrl}/Organisation/GetInfoForCertificate/${orgId}`;
  $http.get(orgInfoUrl).then(function (response) {
    $scope.orgInfo = response.data;

    const admissionInfoUrl = admId
      ? `${baseUrl}/AdmissionReport/GetById/${admId}`
      : `${baseUrl}/AdmissionReport/GetFormByUser/${userId}/${orgId}`;

    $http.get(admissionInfoUrl).then(function (response) {
      applyAdmissionInfo(response.data);
    });
  });
});

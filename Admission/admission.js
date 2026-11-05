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

  function loadOrgThenAdmission(orgId, admissionInfoUrl) {
    const orgInfoUrl = `${baseUrl}/Organisation/GetInfoForCertificate/${orgId}`;
    $http.get(orgInfoUrl).then(function (response) {
      $scope.orgInfo = response.data;
      $http.get(admissionInfoUrl).then(function (response) {
        applyAdmissionInfo(response.data);
      });
    });
  }

  const baseUrl = SvApi.apiBase();
  const query = getQueryParams();

  // Supported:
  //   ?id=18287&orgid=153          → Admissions table row
  //   ?userid=6325&orgid=1         → enrolled student
  //   ?Id=6325-1                   → compact userId-orgId (same as reports)
  let admId = query.id;
  let userId = query.userid;
  let orgId = query.orgid;

  if (admId && String(admId).indexOf("-") >= 0) {
    const parts = String(admId).split("-");
    if (
      parts.length >= 2 &&
      /^\d+$/.test(parts[0]) &&
      /^\d+$/.test(parts[1])
    ) {
      userId = userId || parts[0];
      orgId = orgId || parts[1];
      admId = null;
    }
  } else if (admId && !/^\d+$/.test(String(admId))) {
    admId = null;
  }

  $scope.gender = "";
  $scope.admInfo = { AadharNumber: "" };
  $scope.orgInfo = {};
  $scope.GradeName = "";
  $scope.YearName = "";

  if (admId) {
    const admissionInfoUrl = `${baseUrl}/AdmissionReport/GetById/${admId}`;
    if (orgId) {
      loadOrgThenAdmission(orgId, admissionInfoUrl);
    } else {
      $http.get(admissionInfoUrl).then(function (response) {
        applyAdmissionInfo(response.data);
        const resolvedOrgId =
          ($scope.admInfo && $scope.admInfo.OrganisationId) || 0;
        if (resolvedOrgId) {
          $http
            .get(`${baseUrl}/Organisation/GetInfoForCertificate/${resolvedOrgId}`)
            .then(function (orgResp) {
              $scope.orgInfo = orgResp.data;
            });
        }
      });
    }
    return;
  }

  if (userId && orgId) {
    loadOrgThenAdmission(
      orgId,
      `${baseUrl}/AdmissionReport/GetFormByUser/${userId}/${orgId}`
    );
  }
});

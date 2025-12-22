    var app = angular.module("myApp", []);
    app.controller("myCtrl", function ($scope, $http, $window) {

        // --- Fetching Data and Controller Logic ---
        function getQueryParams() {
            const params = {};
            location.search
                .substr(1)
                .split("&")
                .forEach(function (item) {
                    const [key, value] = item.split("=");
                    if (key) params[key] = decodeURIComponent(value);
                });
            return params;
        }

        const baseUrl = 'https://api.schoolvertex.com/api';
        // const baseUrl = 'http://localhost:62786/api';
        
        const query = getQueryParams();
        const admId = query.id;
        const orgId = query.orgid;

        $scope.gender = '';

        const orgInfoUrl = `${baseUrl}/Organisation/GetInfoForCertificate/${orgId}`;
        $http.get(orgInfoUrl).then(function (response) {
            $scope.orgInfo = response.data;
        });

        const admissionInfoUrl = `${baseUrl}/AdmissionReport/GetById/${admId}`;
        $http.get(admissionInfoUrl).then(function (response) {
            $scope.admInfo = response.data;

            $scope.gender = $scope.admInfo.GenderId == 501 ? 'Male' : $scope.admInfo.GenderId == 502 ? 'Female' : '';
            $scope.admInfo.DateOfBirth = new Date(response.data.DateOfBirth);
            $scope.admInfo.CreatedDate = new Date(response.data.CreatedDate);
            $scope.admInfo.YearId = 9 ? '2026-27' : $scope.admInfo.YearId == 10 ? '2027-28' : '2025-26';

            $scope.GradeName = 'Class/Grade';
            const classInfoUrl = `${baseUrl}/Batch/GetClassNumber/${$scope.admInfo.BatchId}`;
            $http.get(classInfoUrl).then(function (resp) {
                const classNumber = resp.data;
                if (classNumber > 0) {
                    $scope.GradeName = 'Class ' + classNumber;
                } else if(classNumber == -1) {
                    $scope.GradeName = 'UKG';
                } else if(classNumber == -2) {
                    $scope.GradeName = 'LKG';
                } else if(classNumber == -3) {
                    $scope.GradeName = 'NURSERY';
                }
            });
        });

    });
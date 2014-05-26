//=============================== MAIN ===================================
var xClient = angular.module('X-Client', ['ui.router', 'ngResource','GUI','authentication'])
    .config(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/offline');

    $stateProvider

        .state('offline', {

            url: '/offline',
            templateUrl: 'app/partials/offline.html'

        })

        .state('online', {

            url: '/online',
            templateUrl: 'app/partials/online.html'

        })
}])
    .run(['$rootScope',function($rootScope){

    $rootScope
        .$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams){

            console.log("State Change: transition begins!");
        });

    $rootScope
        .$on('$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams){
            console.log("State Change: State change success!");
        });

    $rootScope
        .$on('$stateChangeError',
        function(event, toState, toParams, fromState, fromParams){
            console.log("State Change: Error!");
        });

    $rootScope
        .$on('$stateNotFound',
        function(event, toState, toParams, fromState, fromParams){
            console.log("State Change: State not found!");
        });

    $rootScope
        .$on('$viewContentLoading',
        function(event, viewConfig){
            console.log("View Load: the view is loading, and DOM rendering!");
        });

    $rootScope
        .$on('$viewContentLoaded',
        function(event, viewConfig){
            console.log("View Load: the view is loaded, and DOM rendered!");
        });

}])
    .controller('MainCtrl',[ '$scope','$state', 'authenticationService',function ($scope,$state,authenticationService) {


    $scope.service = authenticationService;
    $scope.$watch('service.getUser()', function(serviceValue) {
        $scope.user = serviceValue;
    });

    $scope.user = null;


    $scope.login = function(loginID, password) {

        authenticationService.login(loginID,password);

        $scope.$on('LOGIN_SUCCESS', function() {
            angular.element( document.querySelector( '.modal-backdrop' )).remove();
            $state.transitionTo('online');
        });

        $scope.$on('LOGIN_FAILED', function() {
            alert('Invalid username or password');
        });

    };
    $scope.register = function(email,password,confirmPassword) {
        $scope.registerResponse = authenticationService.register(email,password,confirmPassword);

    };

}]);


//======================== AUTHENTICATION ==================================
var authentication = angular.module('authentication',[])
    .service('authenticationService',['$rootScope','$resource' ,function ($rootScope,$resource) {

    //properties
    var user = null;

    //getters and setters
    this.getUser = function(){return user;}

    //methods
    this.login = function (loginID, password) {

        //$resource(url, [urlParameters], [actions], options);
        var loginResource = $resource(
            'http://localhost:8181/cxf/x-platform/authentication-rs/login',
            {},
            {
                login:
                {
                    method: 'POST',
                    interceptor:
                    {
                        response: function(response)
                        {
                            if(response.data.loginResponseType == 'LOGIN_SUCCESS' )
                            {
                                user = response.data.email;
                            }
                            $rootScope.$broadcast(response.data.loginResponseType);

                        },
                        responseError: function(responseError)
                        {
                            alert('Rest request failed !');
                        }
                    }
                }
            }
        );

        var loginResponse = new loginResource();
        loginResponse.loginID = loginID;
        loginResponse.password = password;

        loginResponse.$login();
    };
    this.register = function (email, password, confirmPassword) {

        var registerSuccess= true;
        if(registerSuccess)
        {
            return 'Register Success';
        }

        return 'Register Failed';
    };

}]);



//======================= GUI ==============================================
var GUI = angular.module('GUI',[])
    .controller('UICtrl',['$scope','$window', function ($scope,$window) {

    //===================== Window ==============================

    $scope.$on('$viewContentLoaded', function(){
        $scope.handleTopBar();
    });
    $window.onresize = function(){
        $scope.$apply();

        if(($scope.isLeftSideBarActive() && $scope.isRightSideBarActive()) && ($scope.getDevice() == 'mobile' || $scope.getDevice() == 'tablet'))
        {
            $scope.closeLeftSideBar();
            $scope.closeRightSideBar();
        }
        $scope.handleTopBar();
    };
    $scope.getWindowWidth = function(){
        return angular.element($window ).width();
    };
    $scope.$watch($scope.getWindowWidth, function(newWidth){
        $scope.window_width = newWidth;
    });
    $scope.getDevice = function(){
        if($scope.window_width <= 767)
        {
            return 'mobile'
        }
        else if($scope.window_width <= 991 && $scope.window_width > 767)
        {
            return 'tablet'
        }
        else if($scope.window_width <= 1199 && $scope.window_width > 991)
        {
            return 'desktop'
        }
        else if($scope.window_width >= 1200)
        {
            return 'large'
        }
    };

    //===================== Top Bar =============================
    $scope.getTopBarWidth = function(){
        return angular.element( document.querySelector( '#top-bar' ) ).width();
    };
    $scope.$watch($scope.getTopBarWidth, function(newWidth){
        $scope.top_bar_width = newWidth;
    });
    angular.element( document.querySelector( '#top-bar' ) ).onresize = function(){
        $scope.$apply();
        handleTopBar();
    };
    $scope.isTopBarTooSmall = function(){

        if(angular.element( document.querySelector( '#top-bar' )).width() < 324)
        {
            return true;
        }

        return false;
    };
    $scope.handleTopBar = function() {

        //we are on a mobile screen
        if($scope.getDevice() == 'mobile')
        {
            if((!$scope.isLeftSideBarActive() && !$scope.isRightSideBarActive()) || !$scope.isTopBarTooSmall())
            {
                angular.element( document.querySelector("#logo") ).show();
                angular.element( document.querySelector("#left-sidebar-toggle") ).show();
                angular.element( document.querySelector("#right-sidebar-toggle") ).show();
                angular.element( document.querySelector("#top-bar-nav-right") ).show();
                angular.element( document.querySelector("#top-bar-search-toggle") ).show();
                setTimeout(function ()
                {
                    angular.element( document.querySelector( '#top-bar' ) ).attr("style", "overflow:visible !important");

                }, 400);
            }
            else if($scope.isRightSideBarActive())
            {
                angular.element( document.querySelector("#logo") ).hide();
                angular.element( document.querySelector("#left-sidebar-toggle") ).hide();
                angular.element( document.querySelector("#top-bar-search-toggle") ).hide();
                angular.element( document.querySelector("#top-bar-nav-right") ).hide();
                angular.element( document.querySelector( '#top-bar' ) ).attr("style", "overflow:hidden !important");
            }
            else if($scope.isLeftSideBarActive())
            {
                angular.element( document.querySelector("#logo") ).hide();
                angular.element( document.querySelector("#right-sidebar-toggle") ).hide();
                angular.element( document.querySelector("#top-bar-search-toggle") ).hide();
                angular.element( document.querySelector("#top-bar-nav-right") ).hide();
                angular.element( document.querySelector( '#top-bar' ) ).attr("style", "overflow:hidden !important");
            }

        }
        //we are on a tablet screen
        else if($scope.getDevice() == 'tablet')
        {
            angular.element( document.querySelector( '#logo' ) ).show();
            angular.element( document.querySelector( "#left-sidebar-toggle")).show();
            angular.element( document.querySelector( "#right-sidebar-toggle")).show();
            angular.element( document.querySelector( "#top-bar-search-toggle")).hide();
            angular.element( document.querySelector( '#top-bar' ) ).attr("style", "overflow:visible !important");
        }
        //we are on a desktop or large device screen
        else if($scope.getDevice() == 'desktop' || $scope.getDevice()== 'large')
        {
            angular.element( document.querySelector( '#logo' ) ).show();
            angular.element( document.querySelector( "#left-sidebar-toggle")).show();
            angular.element( document.querySelector( "#right-sidebar-toggle")).show();
            angular.element( document.querySelector( "#top-bar-search-toggle")).hide();
            angular.element( document.querySelector( '#top-bar' ) ).attr("style", "overflow:visible !important");
        }


    };

    //===================== Side Bars ===========================
    $scope.toggleLeftSideBar = function(){
        if($scope.getDevice() == 'mobile' || $scope.getDevice() == 'tablet')
        {
            $scope.closeRightSideBar();
        }
        angular.element( document.querySelector( '#page-wrapper' ) ).toggleClass("left-sb-active");
        $scope.handleTopBar();
    };
    $scope.toggleRightSideBar = function(){

        if($scope.getDevice() == 'mobile' || $scope.getDevice() == 'tablet')
        {
            $scope.closeLeftSideBar();
        }
        angular.element( document.querySelector( '#page-wrapper' ) ).toggleClass("right-sb-active");
        $scope.handleTopBar();

    };
    $scope.isLeftSideBarActive = function(){
        if(angular.element( document.querySelector( "#page-wrapper")).hasClass("left-sb-active"))
        {
            return true;
        }

        return false;
    };
    $scope.isRightSideBarActive = function(){
        if(angular.element( document.querySelector( "#page-wrapper")).hasClass("right-sb-active"))
        {
            return true;
        }

        return false;
    };
    $scope.openLeftSideBar = function(){
        angular.element( document.querySelector( "#page-wrapper")).addClass("left-sb-active")
    };
    $scope.openRightSideBar = function(){
        angular.element( document.querySelector( "#page-wrapper")).addClass("right-sb-active")
    };
    $scope.closeLeftSideBar = function(){
        angular.element( document.querySelector( "#page-wrapper")).removeClass("left-sb-active")
    };
    $scope.closeRightSideBar = function(){
        angular.element( document.querySelector( "#page-wrapper")).removeClass("right-sb-active")
    };

    //===================== Authentication =======================
    $scope.openAuthenticationForm = function(){
        $scope.closeLeftSideBar();
        $scope.closeRightSideBar();
    };

}]);

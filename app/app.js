//=============================== MAIN ===================================
var XClient = angular.module('X-Client', ['ui.router','GUI','Authentication'])
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
    .controller('MainCtrl',[ '$scope','$state', 'AuthenticationService',function ($scope,$state,AuthenticationService) {

        $scope.$on('LOGIN_SUCCESS', function(event,data) {
            angular.element( document.querySelector( '.modal-backdrop' )).remove();
            $state.transitionTo('online');
            $scope.user = AuthenticationService.user;
            $scope.token = AuthenticationService.token;
        });
        $scope.$on('REGISTER_SUCCESS', function(event,data) {

            alert(data.email+' we have to do something now that you signed up...validate email or something :)');
        });
}]);

//======================== AUTHENTICATION =================================
var Authentication = angular.module('Authentication',['Rest'])
    .controller('AuthenticationCtrl',[ '$rootScope','$scope', 'AuthenticationService',function ($rootScope,$scope,AuthenticationService) {

        $scope.$on('LOGIN_RESPONSE', function(event,data) {

            if(data.loginResponseType == 'LOGIN_SUCCESS')
            {
                AuthenticationService.user = data.email;
                AuthenticationService.token = data.token;
                $rootScope.$broadcast('LOGIN_SUCCESS', data);
            }
            else
            {
                alert('Invalid Username or Password');
            }

        });
        $scope.$on('LOGIN_ERROR', function(event,errorCode) {

            alert('Login Request Error');

        });
        $scope.login = function(loginID,password){

            AuthenticationService.login(loginID,password);
        }

        $scope.register = function (email, password, confirmPassword) {

            if(confirmPassword!=password)
            {
                alert('Passwords do not match');
                return;
            }

            AuthenticationService.register(email,password);

        };
        $scope.$on('REGISTER_RESPONSE', function(event,data) {

            if(data.registerResponseType == 'REGISTER_SUCCESS')
            {
                $rootScope.$broadcast(data.registerResponseType, data);
            }
            else if(data.signUpResponseType == 'ALREADY_REGISTERED')
            {
                alert('Email Already Registered, please Login instead');
            }
            else
            {
                alert('Sorry we cannot register your email address');
            }

        });
        $scope.$on('REGISTER_ERROR', function(event,errorCode) {

            alert('Register Request Error');

        });

    }])
    .service('AuthenticationService',['$rootScope','RestService',function ($rootScope,RestService) {

        this.user = null;
        this.token = null;
        this.login = function (loginID, password) {

            var url = 'http://localhost:8181/cxf/x-platform/authentication-rs/login';
            var urlParams = {};
            var headers = {loginID:loginID, password:password};
            var isArray = false;
            RestService.get(url,urlParams,headers,isArray,'LOGIN_RESPONSE','LOGIN_ERROR');

        };
        this.register = function (email, password) {

            var url = 'http://localhost:8181/cxf/x-platform/authentication-rs/register';
            var urlParams = {};
            var headers = {};
            var payload = {email:email, password:password};
            RestService.post(url,urlParams,headers,payload,'REGISTER_RESPONSE','REGISTER_ERROR');

        };

    }]);


//======================= GUI =============================================
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


//======================= REST ===========================================
var Rest = angular.module('Rest',['ngResource'])
    .service('RestService',['$rootScope','$resource' ,function ($rootScope,$resource) {

        this.get = function(url,urlParams,headers,isArray,successEvent,errorEvent){

            var resource = $resource(
                url,
                {},
                {
                    get:
                    {
                        method: 'GET',
                        headers: headers,
                        params : urlParams,
                        isArray: isArray,
                        interceptor:
                        {
                            response: function(response)
                            {
                                $rootScope.$broadcast(successEvent, response.data);
                            },
                            responseError: function(responseError)
                            {
                                $rootScope.$broadcast(errorEvent,responseError.status);
                            }
                        }
                    }
                }
            );

            resource.get();
        }
        this.post = function(url,urlParams,headers,payload,successEvent,errorEvent){

            var resource = $resource(
                url,
                {},
                {
                    post:
                    {
                        method: 'POST',
                        headers: headers,
                        params : urlParams,
                        interceptor:
                        {
                            response: function(response)
                            {
                                $rootScope.$broadcast(successEvent, response.data);
                            },
                            responseError: function(responseError)
                            {
                                $rootScope.$broadcast(errorEvent,responseError.status);
                            }
                        }
                    }
                }
            );

            resource.post(payload);
        }


        this.put = function(url,urlParams,headers,payload,successEvent,errorEvent){}
        this.delete = function(url,urlParams,headers,payload,successEvent,errorEvent){}



    }]);

//=============================== MAIN ===================================
var XClient = angular.module('X-Client', ['ui.router','Authentication','Search'])
    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/offline');

        $stateProvider

            .state('offline', {

                url: '/offline',
                templateUrl: 'app/partials/offline.html',
                resolve:
                {
                    checkUserSession : function ($q,AuthenticationService)
                    {
                        var defer = $q.defer();
                        if(AuthenticationService.isUserSessionAlive() == false)
                        {
                            defer.resolve();
                        }
                        else
                        {
                            defer.reject();
                        }

                        return defer.promise;
                    }
                }
            })

            .state('authentication',{

                url:'/authentication',
                templateUrl:'app/partials/authentication.html'
            })

            .state('online', {

                url: '/online',
                templateUrl: 'app/partials/online.html',
                resolve:
                {
                    checkUserSession : function ($q, $timeout,AuthenticationService)
                    {
                        var defer = $q.defer();
                        if(AuthenticationService.isUserSessionAlive() == false)
                        {
                            defer.reject();
                        }
                        else
                        {
                            AuthenticationService.validateUserSession();

                            $timeout(function () {

                                if(AuthenticationService.isUserSessionAlive() == true)
                                {
                                    defer.resolve();
                                }
                                else
                                {
                                    alert('Validate User Session Timeout!');
                                    defer.reject();
                                }

                            }, 2000);
                        }

                        return defer.promise;
                    }
                }
            })

            .state('online.userProfile',{

                url:'/userProfile',
                templateUrl:'app/partials/online/userProfile.html'

            })

            .state('online.newsFeed',{

                url:'/newsFeed',
                templateUrl:'app/partials/online/newsFeed.html'

            })

    }])
    .run(['$rootScope','$state',
        function($rootScope,$state){

        $rootScope
            .$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams){
                console.log("State Change: transition begins :" + ' from '+ fromState.name + ' to '+ toState.name);

            });

        $rootScope
            .$on('$stateChangeSuccess',
            function(event, toState, toParams, fromState, fromParams){
                console.log("State Change: State change success :"+' from '+ fromState.name + ' to '+ toState.name);
            });

        $rootScope
            .$on('$stateChangeError',
            function(event, toState, toParams, fromState, fromParams){

                console.log("State Change: Error :"+' from '+ fromState.name + ' to '+ toState.name);

                if(toState.name == 'online')
                {
                    $state.transitionTo('authentication');
                }

                if(toState.name == 'offline')
                {
                    event.preventDefault;
                    if(fromState.name == null || fromState.name == '')
                    {
                        $state.transitionTo('online.userProfile');
                    }
                }

            });

        $rootScope
            .$on('$stateNotFound',
            function(event, toState, toParams, fromState, fromParams){
                console.log("State Change: State not found :"+' from '+ fromState.name + ' to '+ toState.name);
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
    .controller('MainCtrl',[ '$scope','$state',
        function ($scope,$state) {

            $scope.$on('LOGIN_SUCCESS', function(event,data) {
                $state.transitionTo('online.userProfile');
            });
            $scope.$on('LOGOUT_SUCCESS', function(event,data) {
                $state.transitionTo('offline');
            });
            $scope.$on('REGISTER_SUCCESS', function(event,data) {

                alert(data.email+' we have to do something now that you signed up...validate email or something :)');
            });

        }])
    .controller('GUICtrl',[ '$scope','$state', 'GUIService',
        function ($scope,$state,GUIService) {

        $scope.toggleLSB = function(){
            if(GUIService.isLSBActive())
            {
                GUIService.deactivateLSB();
            }
            else
            {
                GUIService.activateLSB();
                var device = GUIService.getDevice();
                if((device=='mobile' || device =='tablet')&&GUIService.isRSBActive())
                {
                    GUIService.deactivateRSB();
                }
            }

        }
        $scope.toggleRSB = function(){

            if(GUIService.isRSBActive())
            {
                GUIService.deactivateRSB();
            }
            else
            {
                GUIService.activateRSB();
                var device = GUIService.getDevice();
                if((device=='mobile' || device =='tablet')&&GUIService.isLSBActive())
                {
                    GUIService.deactivateLSB();
                }
            }

        }
        $scope.toggleBB = function(){

            if(GUIService.isBBActive())
            {
                GUIService.deactivateBB();
            }
            else
            {
                GUIService.activateBB();
            }

        }

        $scope.goToAuthentication = function(){
            $state.transitionTo('authentication');
        }
        $scope.activateSearch = function(){

        }

    }])
    .service('GUIService',['$rootScope','$window',
        function ($rootScope,$window) {

            this.activateLSB =  function(){angular.element( document.querySelector( "#GUI-middle")).addClass("left-sb-active");}
            this.deactivateLSB =  function(){angular.element( document.querySelector( "#GUI-middle")).removeClass("left-sb-active");}
            this.isLSBActive =  function(){return angular.element( document.querySelector( "#GUI-middle")).hasClass("left-sb-active");}

            this.activateRSB =  function(){angular.element( document.querySelector( "#GUI-middle")).addClass("right-sb-active");}
            this.deactivateRSB =  function(){angular.element( document.querySelector( "#GUI-middle")).removeClass("right-sb-active");}
            this.isRSBActive =  function(){return angular.element( document.querySelector( "#GUI-middle")).hasClass("right-sb-active");}

            this.activateBB =  function(){angular.element( document.querySelector( "#bottom-bar")).addClass("bottom-bar-active");}
            this.deactivateBB =  function(){angular.element( document.querySelector( "#bottom-bar")).removeClass("bottom-bar-active");}
            this.isBBActive =  function(){return angular.element( document.querySelector( "#bottom-bar")).hasClass("bottom-bar-active");}

            $rootScope.getWindowWidth = function(){
                return angular.element($window ).width();
            };
            $rootScope.$watch($rootScope.getWindowWidth, function(newWidth){
                $rootScope.WindowWidth = newWidth;
            });
            this.getDevice = function(){
                if($rootScope.WindowWidth <= 767)
                {
                    return 'mobile'
                }
                else if($rootScope.WindowWidth <= 991 && $rootScope.WindowWidth > 767)
                {
                    return 'tablet'
                }
                else if($rootScope.WindowWidth <= 1199 && $rootScope.WindowWidth > 991)
                {
                    return 'desktop'
                }
                else if($rootScope.WindowWidth >= 1200)
                {
                    return 'large'
                }
            };

        }])
    .controller('TopBarCtrl',['$rootScope','$scope','$window','GUIService',
        function($rootScope,$scope,$window,GUIService){

            $scope.$on('$viewContentLoaded', function(){
                manageElements();
            });
            $window.onresize = function(){
                manageElements();
            };

            var manageElements = function(){
                $scope.$apply();
                var device = GUIService.getDevice();
                //we are on a mobile screen
                if(device == 'mobile')
                {
                    angular.element( document.querySelector( "#top-bar-search-toggle")).show();
                }
                //we are on a tablet screen
                else if(device == 'tablet')
                {
                    angular.element( document.querySelector( "#top-bar-search-toggle")).hide();
                }
                //we are on a desktop or large device screen
                else if(device == 'desktop' || device== 'large')
                {
                    angular.element( document.querySelector( "#top-bar-search-toggle")).hide();
                }

            }

        }])
    .controller('LeftSideBarCtrl',['$scope',
        function($scope){

        }])
    .controller('RightSideBarCtrl',['$scope',
        function($scope){

        }])
    .controller('BottomBarCtrl',['$scope',
        function($scope){

        }]);


//======================== AUTHENTICATION ================================
var Authentication = angular.module('Authentication',['Rest','ngCookies'])
    .controller('AuthenticationCtrl',[ '$rootScope','$scope', 'AuthenticationService',
        function ($rootScope,$scope,AuthenticationService) {

        var validateLoginForm = function(loginID,password){

            var isloginOk = true;
            var isPasswordOk = true;
            var message = 'Missing Fields : ';

            if(loginID == null || loginID == '')
            {
                isloginOk = false;
                message = message + 'ID '

            }

            if(password == null || password == '')
            {
                isPasswordOk = false;
                message = message + 'Password '
            }

            if(isloginOk && isPasswordOk)
            {
                return true;
            }
            else
            {
                $scope.loginMessage = message;
                return false;
            }

        }
        $scope.login = function(loginID,password){

            if(validateLoginForm(loginID,password))
            {
                AuthenticationService.login(loginID,password);
            }

        }
        $scope.$on('LOGIN_RESPONSE', function(event,data) {

            if(data.loginResponseType == 'LOGIN_SUCCESS')
            {
                AuthenticationService.createUserSession(data.loginID, data.token);

                $rootScope.$broadcast('LOGIN_SUCCESS', data);
            }
            else if(data.loginResponseType == 'LOGIN_FAILED')
            {
                $scope.loginMessage = 'Invalid Username or Password';
            }
            else
            {
                $scope.loginMessage = 'Something went wrong';
            }

        });
        $scope.$on('LOGIN_ERROR', function(event,errorCode) {

            alert('Login Request Error');

        });

        var validateRegisterForm = function(email, password, confirmPassword){

            var isEmailOk = true;
            var isPasswordOk = true;
            var isConfPassOk = true;
            var message = 'Missing Fields : '

            if(email == null || email == '')
            {
                isEmailOk = false;
                message = message + 'Email ';
            }

            if(password == null || password == '')
            {
                isPasswordOk = false;
                message = message + 'Password ';
            }

            if(confirmPassword == null || confirmPassword == '' )
            {
                isConfPassOk = false;
                message = message + 'Confirm Password ';
            }

            if(isEmailOk && isPasswordOk && isConfPassOk)
            {
                if(confirmPassword == password)
                {
                    return true;
                }
                else
                {
                    message = 'Passwords do not match'
                }
            }

            $scope.registerMessage = message;
            return false;

        }
        $scope.register = function (email, password, confirmPassword) {

            if(validateRegisterForm(email, password, confirmPassword))
            {
                AuthenticationService.register(email,password);

            }

        };
        $scope.$on('REGISTER_RESPONSE', function(event,data) {

            if(data.registerResponseType == 'REGISTER_SUCCESS')
            {
                $rootScope.$broadcast(data.registerResponseType, data);
                $scope.registerMessage = data.email + ' registered successfully';
            }
            else if(data.registerResponseType == 'ALREADY_REGISTERED')
            {
                $scope.registerMessage = data.email + ' is already registered, Please Login instead';
            }
            else if(data.registerResponseType == 'REGISTER_FAILED')
            {
                $scope.registerMessage = 'Unable to register ' + data.email + 'at this time';
            }
            else
            {
                $scope.registerMessage = 'Something went wrong';
            }

        });
        $scope.$on('REGISTER_ERROR', function(event,errorCode) {

            alert('Register Request Error');

        });

        $scope.logout = function(){
            AuthenticationService.killUserSession();
            $rootScope.$broadcast('LOGOUT_SUCCESS');
        };

    }])
    .service('AuthenticationService',['$rootScope','$cookieStore','RestService',
        function ($rootScope,$cookieStore,RestService) {

        this.createUserSession = function(loginID,token){
            $cookieStore.put('token',token);
            $cookieStore.put('loginID',loginID);

        };
        this.getUserSession = function(){

            return {token: $cookieStore.get('token'), loginID: $cookieStore.get('loginID') };
        };
        this.killUserSession = function(){
            $cookieStore.remove('token');
            $cookieStore.remove('loginID');
        };
        this.isUserSessionAlive = function(){
            var userSession = this.getUserSession();
            if( userSession.loginID != null && userSession.token != null )
            {
                return true;
            }

            return false;
        };

        this.login = function(loginID, password) {

            var url = 'http://localhost:8181/cxf/x-platform/authentication-rs/login';
            var urlParams = {};
            var headers = {loginID:loginID, password:password};
            var isArray = false;
            RestService.get(url,urlParams,headers,isArray,'LOGIN_RESPONSE','LOGIN_ERROR');

        };
        this.register = function(email, password) {

            var url = 'http://localhost:8181/cxf/x-platform/authentication-rs/register';
            var urlParams = {};
            var headers = {};
            var payload = {email:email, password:password};
            RestService.post(url,urlParams,headers,payload,'REGISTER_RESPONSE','REGISTER_ERROR');

        };
        this.validateUserSession = function(){

            var userSession = this.getUserSession();
            var url = 'http://localhost:8181/cxf/x-platform/authentication-rs/validate-user-session';
            var urlParams = {};
            var headers = { loginID: userSession.loginID, token: userSession.token };
            var isArray = false;
            RestService.get(url,urlParams,headers,isArray,'VALIDATE_USER_SESSION_RESPONSE','VALIDATE_USER_SESSION__ERROR');
        };
    }]);


//======================== SEARCH ========================================
var Search = angular.module('Search',['Rest'])
    .controller('SearchCtrl',[ '$rootScope','$scope', 'SearchService',
        function ($rootScope,$scope,SearchService) {

        }])
    .service('SearchService',['$rootScope','RestService',
        function ($rootScope,RestService) {


        }]);


//======================= REST ===========================================
var Rest = angular.module('Rest',['ngResource'])
    .service('RestService',['$rootScope','$resource',
        function ($rootScope,$resource) {

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
//=============================== MAIN ===================================
var XClient = angular.module('X-Client', ['ui.router','GUI','Authentication','Search'])
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
                    },
                    checkSearchPanel: function($q,SearchPanelService)
                    {
                        var defer = $q.defer();
                        if(SearchPanelService.isSearchPanelActive() == false)
                        {
                            defer.resolve();
                        }
                        else
                        {
                            SearchPanelService.deactivateSearchPanel();
                            defer.reject();
                        }

                        return defer.promise;
                    }
                }
            })

            .state('authentication',{

                url:'/authentication',
                templateUrl:'app/partials/authentication.html',
                resolve:
                {
                    checkSearchPanel: function($q,SearchPanelService)
                    {
                        var defer = $q.defer();
                        if(SearchPanelService.isSearchPanelActive() == false)
                        {
                            defer.resolve();
                        }
                        else
                        {
                            SearchPanelService.deactivateSearchPanel();
                            defer.reject();
                        }

                        return defer.promise;
                    }
                }
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
                    },
                    checkSearchPanel: function($q,SearchPanelService)
                    {
                        var defer = $q.defer();
                        if(SearchPanelService.isSearchPanelActive() == false)
                        {
                            defer.resolve();
                        }
                        else
                        {
                            SearchPanelService.deactivateSearchPanel();
                            defer.reject();
                        }

                        return defer.promise;
                    }
                }
            })

            .state('online.userProfile',{

                url:'/userProfile',
                templateUrl:'app/partials/online/userProfile.html',
                resolve:
                {
                    checkSearchPanel: function($q,SearchPanelService)
                    {
                        var defer = $q.defer();
                        if(SearchPanelService.isSearchPanelActive() == false)
                        {
                            defer.resolve();
                        }
                        else
                        {
                            SearchPanelService.deactivateSearchPanel();
                            defer.reject();
                        }

                        return defer.promise;
                    }
                }

            })

            .state('online.newsFeed',{

                url:'/newsFeed',
                templateUrl:'app/partials/online/newsFeed.html',
                resolve:
                {
                    checkSearchPanel: function($q,SearchPanelService)
                    {
                        var defer = $q.defer();
                        if(SearchPanelService.isSearchPanelActive() == false)
                        {
                            defer.resolve();
                        }
                        else
                        {
                            SearchPanelService.deactivateSearchPanel();
                            defer.reject();
                        }

                        return defer.promise;
                    }
                }

            })

    }])
    .run(['$rootScope',
        function($rootScope){

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
    .controller('MainCtrl',['$rootScope','$scope','$state',
        function ($rootScope,$scope,$state) {

            $scope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams){

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
            $scope.$on('LOGIN_SUCCESS', function(event,data) {
                $state.transitionTo('online.userProfile');
            });
            $scope.$on('LOGOUT_SUCCESS', function(event,data) {
                $state.transitionTo('offline');
            });
            $scope.$on('REGISTER_SUCCESS', function(event,data) {

                alert(data.email+' we have to do something now that you signed up...validate email or something :)');
            });
            $scope.$on('GO_TO_AUTHENTICATION', function(event,data) {
                $state.transitionTo('authentication');
            });

        }]);

//======================== GUI ==========================================
var GUI = angular.module('GUI',[])
    .controller('GUICtrl',[ '$rootScope','$scope','$state','$window','GUIService','TopBarService','LeftSideBarService','RightSideBarService','BottomBarService','CenterContentService','SearchPanelService',
        function ($rootScope,$scope,$state,$window,GUIService,TopBarService,LeftSideBarService,RightSidebarService,BottomBarService,CenterContentService,SearchPanelService) {

        $scope.toggleLSB = function(){

            if(LeftSideBarService.isLSBActive())
            {
                LeftSideBarService.deactivateLSB();
            }
            else
            {
                if(SearchPanelService.isSearchPanelActive())
                {
                    SearchPanelService.deactivateSearchPanel();
                }
                LeftSideBarService.activateLSB();
                var device = GUIService.getDevice();
                if((device == 'mobile' || device == 'tablet') && RightSidebarService.isRSBActive())
                {
                    RightSidebarService.deactivateRSB();
                }
            }

        }
        $scope.toggleRSB = function(){

            if(RightSidebarService.isRSBActive())
            {
                RightSidebarService.deactivateRSB();
            }
            else
            {   if(SearchPanelService.isSearchPanelActive())
                {
                    SearchPanelService.deactivateSearchPanel();
                }
                RightSidebarService.activateRSB();
                var device = GUIService.getDevice();
                if((device == 'mobile' || device == 'tablet')&& LeftSideBarService.isLSBActive())
                {
                    LeftSideBarService.deactivateLSB();
                }
            }

        }
        $scope.toggleBB = function(){

            if(BottomBarService.isBBActive())
            {
                BottomBarService.deactivateBB();
            }
            else
            {
                BottomBarService.activateBB();
            }

        }

        $scope.goToAuthentication = function(){
            $rootScope.$broadcast('GO_TO_AUTHENTICATION');
        }
        $scope.activateSearch = function(){
            SearchPanelService.activateSearchPanel();
        }
        $scope.deactivateSearch = function(){
            SearchPanelService.deactivateSearchPanel();
        }

        $window.onresize = function(){

            var device = GUIService.getDevice();
            if(device == 'tablet' || device == 'mobile')
            {
                if(LeftSideBarService.isLSBActive() && RightSidebarService.isRSBActive())
                {
                    LeftSideBarService.deactivateLSB();
                    RightSidebarService.deactivateRSB();
                }
            }

            TopBarService.handleElements(device);
            SearchPanelService.handleElements(device);


        };
        $scope.$on('$viewContentLoaded',function(){
            var device =  GUIService.getDevice();
            TopBarService.handleElements(device);
            SearchPanelService.handleElements(device);
        });
    }])
    .service('GUIService',['$rootScope','$window',
        function ($rootScope,$window) {

            this.getDevice = function(){

                var windowWidth = angular.element($window ).width();
                if(windowWidth <= 767)
                {
                    return 'mobile'
                }
                else if(windowWidth <= 991 && windowWidth > 767)
                {
                    return 'tablet'
                }
                else if(windowWidth <= 1199 && windowWidth > 991)
                {
                    return 'desktop'
                }
                else if(windowWidth >= 1200)
                {
                    return 'large'
                }
            }

        }])
    .service('TopBarService',['$rootScope',
        function ($rootScope) {

            this.handleElements = function(device){

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
    .service('LeftSideBarService',['$rootScope',
        function ($rootScope) {

            this.activateLSB =  function(){angular.element( document.querySelector( "#GUI-middle")).addClass("left-sb-active");}
            this.deactivateLSB =  function(){angular.element( document.querySelector( "#GUI-middle")).removeClass("left-sb-active");}
            this.isLSBActive =  function(){return angular.element( document.querySelector( "#GUI-middle")).hasClass("left-sb-active");}

        }])
    .service('RightSideBarService',['$rootScope',
        function ($rootScope) {

            this.activateRSB =  function(){angular.element( document.querySelector( "#GUI-middle")).addClass("right-sb-active");}
            this.deactivateRSB =  function(){angular.element( document.querySelector( "#GUI-middle")).removeClass("right-sb-active");}
            this.isRSBActive =  function(){return angular.element( document.querySelector( "#GUI-middle")).hasClass("right-sb-active");}

        }])
    .service('BottomBarService',['$rootScope','$window',
        function ($rootScope) {

            this.activateBB =  function(){angular.element( document.querySelector( "#bottom-bar")).addClass("bottom-bar-active");}
            this.deactivateBB =  function(){angular.element( document.querySelector( "#bottom-bar")).removeClass("bottom-bar-active");}
            this.isBBActive =  function(){return angular.element( document.querySelector( "#bottom-bar")).hasClass("bottom-bar-active");}

        }])
    .service('CenterContentService',['$rootScope','$window',
        function ($rootScope) {


        }])
    .service('SearchPanelService',['$rootScope','$window',
        function ($rootScope) {

            this.activateSearchPanel = function(){
                angular.element( document.querySelector( "#search-panel")).addClass("search-panel-active");
            }
            this.deactivateSearchPanel = function(){
                angular.element( document.querySelector( "#search-panel")).removeClass("search-panel-active");
            }
            this.isSearchPanelActive = function(){
                if(angular.element( document.querySelector( "#search-panel")).hasClass("search-panel-active"))
                {
                    return true;
                }

                return false;
            }
            this.handleElements = function(device){

                if(device == 'mobile')
                {
                    angular.element( document.querySelector( "#smdev-search-input")).show();
                    angular.element( document.querySelector( "#search-panel")).css('z-index',999999);

                }
                else
                {
                    angular.element( document.querySelector( "#smdev-search-input")).hide();
                    angular.element( document.querySelector( "#search-panel")).css('z-index',0);
                }
            }

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
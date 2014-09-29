//Directive to manipulate the DOM
//Service to hold and retrieve data
//Controller to assign data to the view via scope

//=============================== MAIN ===================================
var XClient = angular.module('X-Client', ['ui.router','GUI','Search','User'])
    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/offline');

        $stateProvider

            .state('offline', {

                url: '/offline',
                templateUrl: 'app/partials/offline.html',
                resolve:
                {
                    noUserSession : function ($q,UserService)
                    {
                        var defer = $q.defer();
                        if(UserService.userSessionExists() == false)
                        {
                            defer.resolve(true);
                        }
                        else
                        {
                            defer.reject("User Session Exists");
                        }

                        return defer.promise;
                    }

                }
            })

            .state('authentication',{

                url:'/authentication',
                templateUrl:'app/partials/authentication.html',
                controller: 'AuthenticationCtrl',
                resolve:
                {
                    noUserSession : function ($q,UserService)
                    {
                        var defer = $q.defer();
                        if(UserService.userSessionExists() == false)
                        {
                            defer.resolve(true);
                        }
                        else
                        {
                            defer.reject("User session exists");
                        }

                        return defer.promise;
                    }
                }
            })

            .state('online', {

                url: '/online',
                templateUrl: 'app/partials/online.html',
                controller: 'OnlineCtrl',
                resolve:
                {
                    userSession : function ($q,UserService)
                    {
                        var defer = $q.defer();
                        if(UserService.userSessionExists() == true)
                        {
                            defer.resolve(true);
                        }
                        else
                        {
                            defer.reject("User Session does not exist");
                        }

                        return defer.promise;
                    },
                    userAccount: function($q,UserService)
                    {
                        var defer = $q.defer();
                        if(UserService.userSessionExists() == true)
                        {
                            var serverResponse = UserService.getUserAccount()
                            serverResponse.then
                            (
                                function(response)
                                {
                                    defer.resolve(response.data);
                                },
                                function(responseError)
                                {
                                    defer.reject("Could not load user account");
                                }
                            );
                        }
                        else
                        {
                            defer.reject("Could not load User Account because no user session exists");
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
                    userSession : function ($q,UserService)
                    {
                        var defer = $q.defer();
                        if(UserService.userSessionExists() == true)
                        {
                            defer.resolve(true);
                        }
                        else
                        {
                            defer.reject("User Session does not exist");
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
                    userSession : function ($q,UserService)
                    {
                        var defer = $q.defer();
                        if(UserService.userSessionExists() == true)
                        {
                            defer.resolve(true);
                        }
                        else
                        {
                            defer.reject("User Session does not exist");
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

                if(toState.name == 'online' || toState.name == 'online.userProfile' || toState.name == 'online.newsFeed')
                {
                    $state.transitionTo('authentication');
                }

                if(toState.name == 'offline')
                {
                    event.preventDefault;
                    if(fromState.name == null || fromState.name == '')
                    {
                        $state.transitionTo('online');
                    }
                }

                if(toState.name == 'authentication')
                {
                    event.preventDefault;
                }

            });
            $scope.$on('LOGIN_SUCCESS', function(event,data) {
                $state.transitionTo('online.userProfile');
            });
            $scope.$on('LOGIN_FAIL', function(event,data) {
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

//======================== GUI ===========================================
var GUI = angular.module('GUI',[])
    .controller('GUICtrl',[ '$rootScope','$scope','$state','$window','GUIService','TopBarService','LeftSideBarService','RightSideBarService','BottomBarService','CenterContentService','SearchPanelService',
        function ($rootScope,$scope,$state,$window,GUIService,TopBarService,LeftSideBarService,RightSideBarService,BottomBarService,CenterContentService,SearchPanelService) {

        $scope.device = function(){
            return GUIService.getDevice();
        }

        $scope.toggleLSB = function(){

            if(LeftSideBarService.isLSBActive())
            {
                LeftSideBarService.deactivateLSB();
            }
            else
            {
                var device = GUIService.getDevice();

                if(SearchPanelService.isSearchPanelActive())
                {
                    SearchPanelService.deactivateSearchPanel();
                }
                LeftSideBarService.activateLSB(device);

                if((device == 'mobile' || device == 'tablet') && RightSideBarService.isRSBActive())
                {
                    RightSideBarService.deactivateRSB();
                }
            }

        }
        $scope.toggleRSB = function(){

            if(RightSideBarService.isRSBActive())
            {
                RightSideBarService.deactivateRSB();
            }
            else
            {
                var device = GUIService.getDevice();

               if(SearchPanelService.isSearchPanelActive())
                {
                    SearchPanelService.deactivateSearchPanel();
                }
                RightSideBarService.activateRSB(device);

                if((device == 'mobile' || device == 'tablet')&& LeftSideBarService.isLSBActive())
                {
                    LeftSideBarService.deactivateLSB();
                }
            }

        }

        $scope.goToAuthentication = function(){
            if(SearchPanelService.isSearchPanelActive())
            {
                SearchPanelService.deactivateSearchPanel();
            }
            $rootScope.$broadcast('GO_TO_AUTHENTICATION');
        }
        $scope.activateSearch = function(){
            var device = GUIService.getDevice();
            SearchPanelService.activateSearchPanel(device);
            SearchPanelService.handleElements(device);
        }
        $scope.deactivateSearch = function(){
            SearchPanelService.deactivateSearchPanel();
        }

        $window.onresize = function(){

            var device = GUIService.getDevice();
            if(device == 'tablet' || device == 'mobile')
            {
                if(LeftSideBarService.isLSBActive() && RightSideBarService.isRSBActive())
                {
                    LeftSideBarService.deactivateLSB();
                    RightSideBarService.deactivateRSB();
                }
            }

            TopBarService.handleElements(device);
            SearchPanelService.handleElements(device);
            RightSideBarService.handleElements(device);
            LeftSideBarService.handleElements(device);
            CenterContentService.handleElements(device);
            BottomBarService.handleElements(device);
        };
        $scope.$on('$viewContentLoaded',function(){
            var device =  GUIService.getDevice();
            TopBarService.handleElements(device);
            SearchPanelService.handleElements(device);
            RightSideBarService.handleElements(device);
            LeftSideBarService.handleElements(device);
            CenterContentService.handleElements(device);
            BottomBarService.handleElements(device);
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
    .service('TopBarService',['$rootScope','$window',
        function ($rootScope,$window) {

            this.handleElements = function(device){

                //we are on a mobile screen
                if(device == 'mobile')
                {
                    angular.element( document.querySelector( "#top-bar-search-toggle")).show();
                    angular.element( document.querySelector( "#tb-search-bar")).hide();
                    angular.element( document.querySelector( "#tb-user-name")).hide();

                }
                //we are on a tablet screen
                else if(device == 'tablet')
                {
                    angular.element( document.querySelector( "#top-bar-search-toggle")).hide();
                    angular.element( document.querySelector( "#tb-search-bar")).show();
                    angular.element( document.querySelector( "#tb-user-name")).show();
                }
                //we are on a desktop or large device screen
                else if(device == 'desktop' || device== 'large')
                {
                    angular.element( document.querySelector( "#top-bar-search-toggle")).hide();
                    angular.element( document.querySelector( "#tb-search-bar")).show();
                    angular.element( document.querySelector( "#tb-user-name")).show();
                }
            }

        }])
    .service('LeftSideBarService',['$rootScope',
        function ($rootScope) {

            this.activateLSB =  function(device){

                switch (device){

                    case 'mobile':
                        angular.element( document.querySelector( "#page-instance")).addClass("lsb-active-xs");
                        break;
                    case 'tablet':
                        angular.element( document.querySelector( "#page-instance")).addClass("lsb-active-sm");
                        break;
                    case 'desktop':
                        angular.element( document.querySelector( "#page-instance")).addClass("lsb-active-md");
                        break;
                    case 'large':
                        angular.element( document.querySelector( "#page-instance")).addClass("lsb-active-lg");
                        break;
                }
                angular.element( document.querySelector("#lsb-toggle")).addClass("on");

            }
            this.deactivateLSB =  function(){
                angular.element( document.querySelector( "#page-instance")).removeClass("lsb-active-xs");
                angular.element( document.querySelector( "#page-instance")).removeClass("lsb-active-sm");
                angular.element( document.querySelector( "#page-instance")).removeClass("lsb-active-md");
                angular.element( document.querySelector( "#page-instance")).removeClass("lsb-active-lg");
                angular.element( document.querySelector( "#page-instance")).removeClass("lsb-active-lg");
                angular.element( document.querySelector("#lsb-toggle")).removeClass("on");

            }
            this.isLSBActive =  function(){

                if( angular.element( document.querySelector( "#page-instance")).hasClass("lsb-active-xs") ||
                    angular.element( document.querySelector( "#page-instance")).hasClass("lsb-active-sm") ||
                    angular.element( document.querySelector( "#page-instance")).hasClass("lsb-active-md") ||
                    angular.element( document.querySelector( "#page-instance")).hasClass("lsb-active-lg"))
                {
                    return true;
                }

                return false;

            }
            this.handleElements= function(device){

                switch (device){

                    case 'mobile':
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("sm");
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("md");
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("lg");
                        angular.element( document.querySelector( "#left-side-bar")).addClass("xs");
                        break;
                    case 'tablet':
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("xs");
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("md");
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("lg");
                        angular.element( document.querySelector( "#left-side-bar")).addClass("sm");
                        break;
                    case 'desktop':
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("xs");
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("sm");
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("lg");
                        angular.element( document.querySelector( "#left-side-bar")).addClass("md");
                        break;
                    case 'large':
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("xs");
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("sm");
                        angular.element( document.querySelector( "#left-side-bar")).removeClass("md");
                        angular.element( document.querySelector( "#left-side-bar")).addClass("lg");
                        break;
                }

                if(this.isLSBActive())
                {
                    this.deactivateLSB();
                    this.activateLSB(device);
                }
            }

        }])
    .service('RightSideBarService',['$rootScope',
        function ($rootScope) {

            this.activateRSB =  function(device){

                switch (device){

                    case 'mobile':
                        angular.element( document.querySelector( "#page-instance")).addClass("rsb-active-xs");
                        break;
                    case 'tablet':
                        angular.element( document.querySelector( "#page-instance")).addClass("rsb-active-sm");
                        break;
                    case 'desktop':
                        angular.element( document.querySelector( "#page-instance")).addClass("rsb-active-md");
                        break;
                    case 'large':
                        angular.element( document.querySelector( "#page-instance")).addClass("rsb-active-lg");
                        break;
                }
                angular.element( document.querySelector("#rsb-toggle-default")).addClass("on");
                angular.element( document.querySelector("#rsb-toggle-xs")).addClass("on");
            }
            this.deactivateRSB =  function(){
                angular.element( document.querySelector( "#page-instance")).removeClass("rsb-active-xs");
                angular.element( document.querySelector( "#page-instance")).removeClass("rsb-active-sm");
                angular.element( document.querySelector( "#page-instance")).removeClass("rsb-active-md");
                angular.element( document.querySelector( "#page-instance")).removeClass("rsb-active-lg");
                angular.element( document.querySelector("#rsb-toggle-default")).removeClass("on");
                angular.element( document.querySelector("#rsb-toggle-xs")).removeClass("on");

            }
            this.isRSBActive =  function(){

                if( angular.element( document.querySelector( "#page-instance")).hasClass("rsb-active-xs") ||
                    angular.element( document.querySelector( "#page-instance")).hasClass("rsb-active-sm") ||
                    angular.element( document.querySelector( "#page-instance")).hasClass("rsb-active-md") ||
                    angular.element( document.querySelector( "#page-instance")).hasClass("rsb-active-lg"))
                {
                    return true;
                }

                return false;

            }
            this.handleElements= function(device){
                switch (device){

                    case 'mobile':
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("sm");
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("md");
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("lg");
                        angular.element( document.querySelector( "#right-side-bar")).addClass("xs");
                        break;
                    case 'tablet':
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("xs");
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("md");
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("lg");
                        angular.element( document.querySelector( "#right-side-bar")).addClass("sm");
                        break;
                    case 'desktop':
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("xs");
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("sm");
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("lg");
                        angular.element( document.querySelector( "#right-side-bar")).addClass("md");
                        break;
                    case 'large':
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("xs");
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("sm");
                        angular.element( document.querySelector( "#right-side-bar")).removeClass("md");
                        angular.element( document.querySelector( "#right-side-bar")).addClass("lg");
                        break;
                }

                if(this.isRSBActive())
                {
                    this.deactivateRSB();
                    this.activateRSB(device);
                }
            }
        }])
    .service('BottomBarService',['$rootScope',
        function ($rootScope) {

            this.handleElements = function(device){

            }

        }])
    .service('CenterContentService',['$rootScope',
        function ($rootScope) {

            this.handleElements= function(device)
            {
                switch(device)
                {
                    case 'mobile':
                        angular.element( document.querySelector( "#page-instance")).addClass("xs");
                        break;
                    default:
                        angular.element( document.querySelector( "#page-instance")).removeClass("xs");
                        break;
                }
            }

        }])
    .service('SearchPanelService',['$rootScope',
        function ($rootScope) {

            this.activateSearchPanel = function(device){

                if(device=='mobile')
                {
                    angular.element( document.querySelector( "#search-panel")).addClass("search-panel-active-xs");
                }
                else
                {
                    angular.element( document.querySelector( "#search-panel")).addClass("search-panel-active-default");
                }

            }
            this.deactivateSearchPanel = function(){
                angular.element( document.querySelector( "#search-panel")).removeClass("search-panel-active-xs");
                angular.element( document.querySelector( "#search-panel")).removeClass("search-panel-active-default");
            }
            this.isSearchPanelActive = function(){
                if(angular.element( document.querySelector( "#search-panel")).hasClass("search-panel-active-xs") || angular.element( document.querySelector( "#search-panel")).hasClass("search-panel-active-default"))
                {
                    return true;
                }

                return false;
            }
            this.handleElements = function(device){

                if(this.isSearchPanelActive())
                {
                    if(device == 'mobile')
                    {
                        angular.element( document.querySelector( "#search-panel-input")).show();
                        angular.element( document.querySelector( "#search-panel")).addClass("search-panel-active-xs");
                        angular.element( document.querySelector( "#search-panel")).removeClass("search-panel-active-default");
                    }
                    else
                    {
                        angular.element( document.querySelector( "#search-panel-input")).hide();
                        angular.element( document.querySelector( "#search-panel")).addClass("search-panel-active-default");
                        angular.element( document.querySelector( "#search-panel")).removeClass("search-panel-active-xs");
                    }
                }
                else
                {
                        angular.element( document.querySelector( "#search-panel-input")).show();
                }

            }

        }]);

//======================== USER ==========================================
var User = angular.module('User',['Rest','ngCookies'])
    .controller('AuthenticationCtrl',[ '$rootScope','$scope','UserService',
        function ($rootScope,$scope,UserService) {

            //Sign Up
            var validateSignUpForm = function(signUpForm){

                var isEmailOk = true;
                var isPasswordOk = true;
                var isConfPassOk = true;
                var message = 'Missing Fields : '

                if(signUpForm.email == null || signUpForm.email == '')
                {
                    isEmailOk = false;
                    message = message + 'Email ';
                }

                if(signUpForm.password == null || signUpForm.password == '')
                {
                    isPasswordOk = false;
                    message = message + 'Password ';
                }

                if(signUpForm.confirmPassword == null || signUpForm.confirmPassword == '' )
                {
                    isConfPassOk = false;
                    message = message + 'Confirm Password ';
                }

                if(isEmailOk && isPasswordOk && isConfPassOk)
                {
                    if(signUpForm.confirmPassword == signUpForm.password)
                    {
                        return true;
                    }
                    else
                    {
                        message = 'Passwords do not match'
                    }
                }

                $scope.signUpMessage = message;
                return false;

            }
            $scope.signUp = function(signUpForm){

                if(validateSignUpForm(signUpForm) == true)
                {
                    var userAccount = {
                        id: null,
                        userAccountType: 'BASIC',
                        email: signUpForm.email,
                        password: signUpForm.password,
                        userProfiles: {}
                    }
                    UserService.createUserAccount(userAccount);
                }
            }
            $scope.$on('CREATE_USER_ACCOUNT_RESPONSE', function(event,response) {

                alert('Account created, please log in');

            });
            $scope.$on('CREATE_USER_ACCOUNT__ERROR', function(event,error) {

                alert('Create User Profile Request Error');

            });

            //Login
            var validateLoginForm = function(loginForm){

                var isEmailOk = true;
                var isPasswordOk = true;
                var message = 'Missing Fields : ';

                if(loginForm.email == null || loginForm.email == '')
                {
                    isEmailOk = false;
                    message = message + 'Email '

                }

                if(loginForm.password == null || loginForm.password == '')
                {
                    isPasswordOk = false;
                    message = message + 'Password '
                }

                if(isEmailOk && isPasswordOk)
                {
                    return true;
                }
                else
                {
                    $scope.loginMessage = message;
                    return false;
                }

            }
            $scope.login = function(loginForm){

                if(validateLoginForm(loginForm))
                {
                    UserService.loginUserAccount(loginForm.email,loginForm.password);
                }

            }
            $scope.$on('LOGIN_RESPONSE', function(event,response) {
                var userAccountId = response.data.userAccountId;
                var token = response.data.token;
                if(userAccountId != null && token!= null)
                {
                    UserService.createUserSession(userAccountId,token);
                    $rootScope.$broadcast('LOGIN_SUCCESS');
                    return;
                }

                $rootScope.$broadcast('LOGIN_FAIL');

            });
            $scope.$on('LOGIN_ERROR', function(event,error) {

                alert('Login Error');

            });

        }])
    .controller('OnlineCtrl',[ '$rootScope','$scope','UserService','userAccount',
        function ($rootScope,$scope,UserService,userAccount) {

            $scope.userAccount = userAccount;
            //Logout
            $scope.logout = function(){
                UserService.deleteUserSession();
                $rootScope.$broadcast('LOGOUT_SUCCESS');
            }
        }])
    .service('UserService',['$rootScope','$cookieStore','RestService',
        function ($rootScope,$cookieStore,RestService) {

            this.createUserAccount = function(userAccount){
                var url = 'http://localhost:8181/cxf/x-platform/user-rs/create/userAccount';
                var urlParams = {};
                var headers = {};
                var payload = userAccount;
                return RestService.post(url,urlParams,headers, payload, 'CREATE_USER_ACCOUNT_RESPONSE','CREATE_USER_ACCOUNT__ERROR');
            };
            this.loginUserAccount = function(email, password){
                var url = 'http://localhost:8181/cxf/x-platform/user-rs/login';
                var urlParams = {};
                var headers = {email:email, password:password};
                var isArray = false;

                return RestService.get(url,urlParams,headers,isArray, 'LOGIN_RESPONSE','LOGIN_ERROR');
            };
            this.getUserAccount = function(){
                var userSession = this.getUserSession();
                var url = 'http://localhost:8181/cxf/x-platform/user-rs/get/userAccount/:userAccountId';
                var urlParams = {userAccountId: userSession.userAccountId};
                var headers = {token: userSession.token};
                var isArray = false;

                return RestService.get(url,urlParams,headers,isArray, 'GET_USER_ACCOUNT_RESPONSE','GET_USER_ACCOUNT_ERROR');
            };
            this.createUserSession = function(userAccountId,token){
                $cookieStore.put('userAccountId',userAccountId);
                $cookieStore.put('token',token);
            };
            this.getUserSession = function(){

                return {token: $cookieStore.get('token'), userAccountId: $cookieStore.get('userAccountId') };
            };
            this.deleteUserSession = function(){
                $cookieStore.remove('userAccountId');
                $cookieStore.remove('token');
            };
            this.userSessionExists = function(){
                var userSession = this.getUserSession();
                if( userSession.userAccountId != null && userSession.token != null )
                {
                    return true;
                }

                return false;
            };
            this.validateUserSession = function(){

                var userSession = this.getUserSession();
                var url = 'http://localhost:8181/cxf/x-platform/user-rs/validate/session';
                var urlParams = {};
                var headers = { userAccountId: userSession.userAccountId, token: userSession.token };
                var isArray = false;
                return RestService.get(url,urlParams,headers,isArray,'VALIDATE_USER_SESSION_RESPONSE','VALIDATE_USER_SESSION_ERROR');
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
    .service('RestService',['$rootScope','$resource','$q',
        function ($rootScope,$resource, $q) {

        this.get = function(url,urlParams,headers,isArray,successEvent,errorEvent){
            var defer = $q.defer();
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
                                defer.resolve(response);
                                $rootScope.$broadcast(successEvent, response);
                            },
                            responseError: function(responseError)
                            {
                                defer.reject(responseError);
                                $rootScope.$broadcast(errorEvent,responseError);
                            }
                        },
                        timeout:5000
                    }
                }
            );

            resource.get();
            return defer.promise;
        }
        this.post = function(url,urlParams,headers,payload,successEvent,errorEvent){
            var defer = $q.defer();
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
                                defer.resolve(response);
                                $rootScope.$broadcast(successEvent, response);
                            },
                            responseError: function(responseError)
                            {
                                defer.reject(responseError);
                                $rootScope.$broadcast(errorEvent,responseError);
                            }
                        },
                        timeout:5000
                    }
                }
            );

            resource.post(payload);
            return defer.promise;
        }
        this.put = function(url,urlParams,headers,payload,successEvent,errorEvent){}
        this.delete = function(url,urlParams,headers,payload,successEvent,errorEvent){}
    }]);


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

                if(toState.name == 'authentication')
                {
                    event.preventDefault;
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
        function ($rootScope,$scope,$state,$window,GUIService,TopBarService,LeftSideBarService,RightSideBarService,BottomBarService,CenterContentService,SearchPanelService) {

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
                if(BottomBarService.isBBActive())
                {
                    BottomBarService.deactivateBB();
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
                var device = GUIService.getDevice();

            {   if(SearchPanelService.isSearchPanelActive())
                {
                    SearchPanelService.deactivateSearchPanel();
                }
                if(BottomBarService.isBBActive())
                {
                    BottomBarService.deactivateBB();
                }
                RightSideBarService.activateRSB(device);

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
                if(RightSideBarService.isRSBActive())
                {
                    RightSideBarService.deactivateRSB();
                }
                if(LeftSideBarService.isLSBActive())
                {
                    LeftSideBarService.deactivateLSB();
                }

                BottomBarService.activateBB();
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


        };
        $scope.$on('$viewContentLoaded',function(){
            var device =  GUIService.getDevice();
            TopBarService.handleElements(device);
            SearchPanelService.handleElements(device);
            RightSideBarService.handleElements(device);
            LeftSideBarService.handleElements(device);
            CenterContentService.handleElements(device);
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
                    angular.element( document.querySelector( "#tb-search-bar")).hide();

                    angular.element( document.querySelector( "#rsb-toggle-xs")).show();
                    angular.element( document.querySelector( "#rsb-toggle-default")).hide();

                    angular.element( document.querySelector( "#tb-user-name")).hide();

                    angular.element( document.querySelector( "#top-bar-mail-toggle")).removeClass("fixed-width");
                    angular.element( document.querySelector( "#top-bar-home-toggle")).removeClass("fixed-width");
                    angular.element( document.querySelector( "#top-bar-notifications-toggle")).removeClass("fixed-width");
                    angular.element( document.querySelector( "#top-bar-tasks-toggle")).removeClass("fixed-width");

                    angular.element( document.querySelector( "#tb-left")).addClass("xs");
                    angular.element( document.querySelector( "#lsb-toggle")).addClass("xs");
                    angular.element( document.querySelector( "#tb-logo")).addClass("xs");




                }
                //we are on a tablet screen
                else if(device == 'tablet')
                {
                    angular.element( document.querySelector( "#top-bar-search-toggle")).hide();
                    angular.element( document.querySelector( "#tb-search-bar")).show();

                    angular.element( document.querySelector( "#rsb-toggle-xs")).hide();
                    angular.element( document.querySelector( "#rsb-toggle-default")).show();

                    angular.element( document.querySelector( "#tb-user-name")).hide();

                    angular.element( document.querySelector( "#top-bar-mail-toggle")).addClass("fixed-width");
                    angular.element( document.querySelector( "#top-bar-home-toggle")).addClass("fixed-width");
                    angular.element( document.querySelector( "#top-bar-notifications-toggle")).addClass("fixed-width");
                    angular.element( document.querySelector( "#top-bar-tasks-toggle")).addClass("fixed-width");

                    angular.element( document.querySelector( "#tb-left")).removeClass("xs");
                    angular.element( document.querySelector( "#lsb-toggle")).removeClass("xs");
                    angular.element( document.querySelector( "#tb-logo")).removeClass("xs");
                }
                //we are on a desktop or large device screen
                else if(device == 'desktop' || device== 'large')
                {
                    angular.element( document.querySelector( "#top-bar-search-toggle")).hide();
                    angular.element( document.querySelector( "#tb-search-bar")).show();

                    angular.element( document.querySelector( "#rsb-toggle-xs")).hide();
                    angular.element( document.querySelector( "#rsb-toggle-default")).show();

                    angular.element( document.querySelector( "#tb-user-name")).show();

                    angular.element( document.querySelector( "#top-bar-mail-toggle")).addClass("fixed-width");
                    angular.element( document.querySelector( "#top-bar-home-toggle")).addClass("fixed-width");
                    angular.element( document.querySelector( "#top-bar-notifications-toggle")).addClass("fixed-width");
                    angular.element( document.querySelector( "#top-bar-tasks-toggle")).addClass("fixed-width");

                    angular.element( document.querySelector( "#tb-left")).removeClass("xs");
                    angular.element( document.querySelector( "#lsb-toggle")).removeClass("xs");
                    angular.element( document.querySelector( "#tb-logo")).removeClass("xs");
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

            }
            this.deactivateLSB =  function(){
                angular.element( document.querySelector( "#page-instance")).removeClass("lsb-active-xs");
                angular.element( document.querySelector( "#page-instance")).removeClass("lsb-active-sm");
                angular.element( document.querySelector( "#page-instance")).removeClass("lsb-active-md");
                angular.element( document.querySelector( "#page-instance")).removeClass("lsb-active-lg");
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

            }
            this.deactivateRSB =  function(){
                angular.element( document.querySelector( "#page-instance")).removeClass("rsb-active-xs");
                angular.element( document.querySelector( "#page-instance")).removeClass("rsb-active-sm");
                angular.element( document.querySelector( "#page-instance")).removeClass("rsb-active-md");
                angular.element( document.querySelector( "#page-instance")).removeClass("rsb-active-lg");
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
    .service('BottomBarService',['$rootScope','$window',
        function ($rootScope) {

            this.activateBB =  function(){angular.element( document.querySelector( "#bottom-bar")).addClass("bottom-bar-active");}
            this.deactivateBB =  function(){angular.element( document.querySelector( "#bottom-bar")).removeClass("bottom-bar-active");}
            this.isBBActive =  function(){return angular.element( document.querySelector( "#bottom-bar")).hasClass("bottom-bar-active");}

        }])
    .service('CenterContentService',['$rootScope','$window',
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
    .service('SearchPanelService',['$rootScope','$window',
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
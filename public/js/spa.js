$.ajax({
  type: 'OPTIONS',
  url: '/',
  headers: {
    'Accept': 'application/json'
  },
  success: function(data) {
    console.log('OPTIONS of Maki app retrieved:', data);

    window.Resources = data.resources;
    window.__models = {};
    window.makiConfig = data;

    Object.keys(data.resources).forEach(function(name) {
      __models[name] = {
          attributes:data.resources[name].attributes,
          plural:data.resources[name].plural,
      };
    });

    $(document).trigger('loaded');

    console.log('__models:', __models);
  }
});

function plural(modelName) {
    return __models[modelName].plural;
}

$(document).on('loaded', function() {

  window.markdown = marked;

  (function(angular) {
    'use strict';

    var models = __models;
    var app = angular.module('MakiApp', ['ngRoute', 'ngAnimate']);

    initApp();

    angular.bootstrap(document, ["MakiApp"]);

    function getFunctionBody(func) {
      var fn = "" + func;
      var fnBody = fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}"));
      return fnBody;
    }

    function getParamNames(func) {
      var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
      var ARGUMENT_NAMES = /([^\s,]+)/g;
      var fnStr = func.toString().replace(STRIP_COMMENTS, '');
      var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
      if (result === null)
        result = [];
      return result;
    }

    function initApp() {

      console.log('init');

      app.controller('MainController', MainController);

      initDefaultControllers(models);
      initDefaultRoutes(models);

      function initDefaultActions(modelName, $scope, $http, $window, $route) {

        $scope.modelName = modelName;
        var modelsName = plural(modelName);
        $scope.modelsName = modelsName;

        $scope.create = function() {
          $http({
            method: "post",
            url: "/" + modelsName.toLowerCase()  + "/",
            data: $scope.item,
            headers: { 'Accept': 'application/json' }
          }).then(
            function(response) {
              //console.log('create '+response.data);
              $scope.$emit('FlashMessage', {
                FlashType: 'success',
                FlashMsg: '<h4>Cowabunga!</h4>Successfully created new ' + modelName
              });
              if ($window.location.href.indexOf(modelName + 's/new') >= 0) {
                window.setTimeout(function() {
                  $window.location.href = '/' + modelName + 's/';
                }, 3000);
              }
              $scope.reset();
              if ($scope._listed) {
                $scope.list();
              }
            },
            function(err) {
              console.log(err);
              $scope.$emit('FlashMessage', {
                FlashType: 'error',
                FlashMsg: '<h4>Wipeout!</h4>Failed to create ' + modelName
              });
            }
          );
        };

        $scope.delete = function(item) {
          $http({
            method: "delete",
            url: "/" + modelsName.toLowerCase() + "/" + item._id,
            //params: {
              //id: item._id
            //}
          }).then(
            function(response) {
              console.log(response.data);
              $scope.$emit('FlashMessage', {
                FlashType: 'success',
                FlashMsg: '<h4>Cowabunga!</h4>Successfully deleted ' + modelName
              });
              if ($scope._listed) {
                $scope.list();
              }
            },
            function(err) {
              console.log(err);
              $scope.$emit('FlashMessage', {
                FlashType: 'error',
                FlashMsg: '<h4>Wipeout!</h4>Failed to delete ' + modelName
              });

            }
          );
        };

        $scope.list = function() {
          console.log("LISTING");
          $http({
            method: "get",
            url: "/" + modelsName.toLowerCase() + "/"
          }).then(
            function(response) {
              console.log(response.data);
              $scope.items = response.data;
              $scope[modelName.toLowerCase() + 's'] = response.data;
              $scope._listed = true;
            },
            function(err) {
              console.log(err);
            }
          );
        };

        $scope.load = function(populate, after) {
          console.log("LOADING");
          var id = $route.current.params.id;
          $scope._id = id;
          $scope._item_url = modelsName + '/' + id;

          var params = populate ? (populate instanceof Array ? {
            populate: populate.join()
          } : {
            populate: populate
          }) : null;

          console.log("GET PARAMS");
          console.log(params);

          $http({
            method: 'get',
            url: '/' + modelsName.toLowerCase() + '/' + id,
            params: params
          }).then(
            function(response) {
              console.log("DATA:");
              console.log(response.data);
              $scope.item = response.data;
              $scope.master = angular.copy(response.data);
              $scope[modelName.toLowerCase()] = response.data;
              $scope._loaded = true;

              if (after) {
                if (after instanceof Array) {
                  after.forEach(function(i) {
                    $scope.action(after.target, after.model, 'get', response.data[i.source]);
                  });
                } else {
                  $scope.action(after.target, after.model, 'get', response.data[after.source]);
                }
              }

            },
            function(err) {
              console.log(err);
            }
          );
        };

        $scope.new = function(){
            var schema = angular.copy( __models[modelName].attributes );
            var item = {};
            Object.keys(schema).forEach(function(key){
                item[key] = "";
            });
            $scope.schema = schema;
            $scope.item = item;
            console.log($scope.item);
        };

        $scope.action = function(targetProperty, modelName, action, id, data) {

          var modelsName = plural(modelName);
          var url = "/" + modelsName.toLowerCase() + "/" + action + "/";

          if (id) {
            url += id;
          }
          console.log('action');
          console.log(url);

          $http({
            method: "get",
            url: url,
            params: data
          }).then(
            function(response) {
              console.log(response.data);
              $scope[targetProperty] = response.data;
            },
            function(err) {
              console.log(err);
            }
          );
        };

        $scope.master = {};

        $scope.update = function(item) {
          $scope.master = angular.copy(item);
        };

        $scope.reset = function() {
          console.log('reverting to');
          console.log($scope.master);
          $scope.item = angular.copy($scope.master);
        };

        $scope.save = function(item) {
          if (!item) {
            $scope.master = angular.copy($scope.item);
          }

          console.log('trying to save');
          console.log($scope.item);

          $http({
            method: 'PATCH',
            url: '/' + modelsName.toLowerCase() + '/',
            headers: { 'Accept': 'application/json' } ,
            data: item ? item : $scope.item
          }).then(
            function(response) {
              console.log('saved');
              $scope.$emit('FlashMessage', {
                FlashType: 'success',
                FlashMsg: '<h4>Cowabunga!</h4>Successfully updated ' + modelName
              });
              if ($window.location.href.indexOf('/edit') >= 0) {
                window.setTimeout(function() {
                  $window.location.href = '/' + modelName + 's/';
                }, 3000);
              }
              console.log(response.data);
              //$scope.list();
            },
            function(err) {
              console.log(err);
              $scope.$emit('FlashMessage', {
                FlashType: 'error',
                FlashMsg: '<h4>Wipeout!</h4>Failed to update ' + modelName
              });
            }
          );
        };
      }

      function execDefaultActions($scope) {
        //$scope.list();
        $scope.reset();
      }

      function initDefaultControllers(models) {
        Object.keys(models).forEach(function(modelName) {

          var model = models[modelName];

          var defaultInitFunction = function($scope, $http, $window, $route) {
            initDefaultActions(modelName, $scope, $http, $window, $route);
            execDefaultActions($scope);
            $scope._controller = model;
          };

          function mergeFunctions(a, b) {
            var paramsA = getParamNames(a);
            var paramsB = getParamNames(b);

            var codeA = getFunctionBody(a);
            var codeB = getFunctionBody(b);

            var addedParams = {};
            for (var i in paramsA) {
              addedParams[paramsA[i]] = true;
            }
            for (var i in paramsB) {
              addedParams[paramsB[i]] = true;
            }

            var result = "(function(" + Object.keys(addedParams).join() + "){\n" + codeA + '\n' + codeB + "\n})";

            return result;
          }

          function evalInContext(js, context) {
            return function() {
              return eval(js);
            }.call(context);
          }

          function mergeFunctionsInContext(a, b, context) {
            evalInContext(mergeFunctions(a, b), context);
          }

          console.log(modelName + "Controller");

          if (model && model.$init) {
            console.log('custom init function:');
            console.log(model.$init);

            //var func = (defaultInitFunction, model.$init, this);
            var func = evalInContext(mergeFunctions(defaultInitFunction, model.$init), this);
            console.log(func);

            app.controller(modelName + "Controller", func);
          } else {
            app.controller(modelName + "Controller", defaultInitFunction);
          }
        });
      }

      function initDefaultRoutes(models) {

        window.GeneralView = function(el, attrs) {
          console.log('GeneralView', el, attrs);
        };

        app.config(function($routeProvider, $locationProvider) {

          Object.keys(models).forEach(function(modelName) {

            var modelsName = plural(modelName);
            var viewPathPrefix = "";

            var modelView = function() {
              console.log('thing:', makiConfig.config);
              console.log('resource:', Resources[modelName]);

              var resource = Resources[modelName];
              // TODO: use .get when single, .query when multiple
              var template = resource.templates.query;

              // TODO: auto-populate this
              var locals = {
                page: {},
                messages: {
                  info: [],
                  warning: [],
                  success: [],
                  error: []
                },
                user: {},
                config: makiConfig.config
              };

              // TODO: use real data!
              //locals[ resource.names.query ] = $scope.items;
              locals[ resource.names.query ] = [];

              return jade.render(template, locals);
            };

            $routeProvider.when('/' + modelsName + '/', {
              template: modelView,
              controller: modelName + 'Controller'
            });

            $routeProvider.when('/' + modelName + '/', {
              templateUrl: '/views/' + viewPathPrefix + 'index.html',
              controller: modelName + 'Controller'
            });

            $routeProvider.when('/' + modelsName + '/:id', {
              templateUrl: function(urlattr) {
                var url = '/views/' + viewPathPrefix + 'show.html';
                //if (urlattr.id.length != 24) {
                //  url = '/views/' + viewPathPrefix + urlattr.id + '.html';
                //}
                console.log("SHOW URL" + url);
                return url;
              },
              controller: modelName + 'Controller'
            });

            $routeProvider.when('/' + modelsName + '/:id/:action', {
              templateUrl: function(urlattr) {
                var url = '/views/' + viewPathPrefix + urlattr.action + '.html';
                console.log(url);
                return url;
              },
              controller: modelName + 'Controller'
            });

            $routeProvider.when('/' + modelsName + '/:action', {
              templateUrl: function(urlattr) {
                var url = '/views/' + viewPathPrefix + urlattr.action + '.html';
                console.log(url);
                return url;
              },
              controller: modelName + 'Controller'
            });
          });

          // configure html5 to get links working on jsfiddle
          //$locationProvider.html5Mode(true);

          $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
          });
        });
      }
    }

  })(window.angular);

});

function MainController($scope, $route, $routeParams, $location, $http) {
  $scope.$route = $route;
  $scope.$location = $location;
  $scope.$routeParams = $routeParams;
  $scope.models = window.__models;
  $scope.title = "Melody!!!1";
  $scope.footer = "Very Info";
  $scope.flashes = [];

  $scope.$on('FlashMessage', function(event, args) {
    //Flash.create(args.FlashType, args.FlashMsg, 'customAlert');
    $scope.flashes.push({type:args.FlashType, text:args.FlashMsg});
    console.log("Flash triggered");
  });

  $scope.action = MainControllerAction;
}

function MainControllerAction(targetProperty, modelName, action, id, data) {
  if(!window.__models[modelName]) return;

  var url = '/' + plural(modelName) + '/' + action + '/';

  if (id) {
    url += id;
  }
  console.log('action');
  console.log(url);

  $http({
    method: 'get',
    url: url,
    params: data
  }).then(
    function(response) {
      //console.log(response.data);
      $scope[targetProperty] = response.data;
    },
    function(err) {
      console.log(err);
    }
  );
}

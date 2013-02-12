function TargetListCtrl($scope, $http) {
  $scope.targetModal = function(target) {
    $scope.single = target;
  };

  $scope.resetForm = function() {
    $scope.error = false;
    $scope.success = false;
  };
  $scope.orderProp = "name";
  getTargets();
  socket.on('update:targets', function() {
    getTargets();
  });
  function getTargets() {
    $http.get('/targets').success(function(data) {
      $scope.targets = data.targets;
    });
  };
}

function TargetDeleteCtrl($scope, $http) {
  $scope.id = '';
  $scope.success = false;
  $scope.error = false;

  $scope.resetForm = function() {
    $scope.id = '';
    $scope.success = false;
    $scope.error = false;
  };
  $scope.deleteTarget = function() {
      var url = '/target/' + $scope.id;
      $http.delete(url).success(function(data) {
      $scope.success = true;
      $scope.id = '';
    }).
    error(function(data) {
      $scope.error = true;
    });
  };
}

function TargetAddCtrl($scope, $http) {
  $scope.resetForm = function() {
    $scope.id = '';
    $scope.success = false;
    $scope.error = false;
  };
  $scope.createTarget = function() {
    $http.post('/target', $scope.target).success(function(data) {
      $scope.success = true;
      $scope.id = data.target._id;
      $scope.target = {};
    }).
    error(function(data) {
      $scope.error = true;
    })
  };
}

function DefaultHandlerCtrl($scope) {
  $scope.ip = 'ip';
  $scope.port = 'port';
  socket.on('defaults', function(data) {
    $scope.ip = data.ip;
    $scope.port = data.port;
    $scope.$apply();
  });
}

function HandlerCtrl($scope) {
  $scope.handlers = [];
  $scope.count = 0;
  $scope.orderProp = "health";
  socket.on('handler:status', function(data) {
    $scope.handlers = data;
    $scope.$apply();
  });
}

function SessionCtrl($scope, $http) {
  var sessions = {};
  $scope.date = new Date();
  $scope.data = [];
  socket.on('request', function(data) {
    if (data.url.match('/[a-z-A-Z-0-9]{4}_')) {
      if(!sessions.hasOwnProperty(data.ip)) {
        sessions[data.ip] = {}; 
      }
      if (!sessions[data.ip].hasOwnProperty(data.url)) {
        messagebox('<strong>New Session!</strong><br>Host: ' + data.ip);
        $http.get('/targets').success(function(targets) {
          sessions[data.ip][data.url] = true;
          for (var k in sessions) {
            var name = findSessionIp(k, targets.targets);
            $scope.data.push({"ip": data.ip, "count": Object.keys(sessions[k]).length, "name": name});
          }
        });
        $scope.data = [];
      }
   }
 });
}

function findSessionIp(ip, targets) {
  for(var i = 0; i < targets.length; i++) {
    if (targets[i].remote_ip.indexOf(ip) > -1) {
      return targets[i].name;
    }
  }
  return 'Unknown';
}

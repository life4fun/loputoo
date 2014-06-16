
function MainCtrl($scope, $timeout, $interval) {

  $scope.tasks = [];
  $scope.editedTask = null;
  $scope.pouchdb = new PouchDB('loputoo', function (err, db) {
    if (err) {
      console.log(err);
    }
    else {
      db.allDocs(function (err, response) {
        if (err) {
          console.log(err);
        }
        else {

		  var remoteCoach = 'http://admin:admin@loputoo.iriscouch.com/loputoo';
		  $scope.pouchdb.replicate.to(remoteCoach, {live: true});
		  $scope.pouchdb.replicate.from(remoteCoach, {live: true}); 
		  $scope.loadTasks(response.rows);
		  
        }
      });
    }
  }
  );

  $scope.loadTasks = function (tasks) {
    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
	  
      $scope.pouchdb.get(task.id, function (err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          $scope.$apply(function () {
            $scope.tasks.push(doc);
          });
        }
      });
    }
    ;
  }
  

  $scope.addTask = function () {
    var newTask = {
      _id: new Date().toISOString(),
      text: $scope.taskDescription,
	  editing: false,
      done: false
    };
    $scope.tasks.push(newTask);
    $scope.taskText = '';
	console.log(newTask);
    $scope.pouchdb.put(newTask);
    $timeout(function() {
       location.reload(true);
    }, 200);
  };

  
  
  
  $scope.updateTask = function (task) {
  task.done = event.target.checked;
  console.log(task);
  $scope.pouchdb.put(task);	
  };
  
  

   $scope.startEditing = function(task){
        task.editing=true;
        $scope.editedTask = task;
    }
        
    $scope.doneEditing = function(task){
        task.editing=false;
		$scope.editedTask = null;
		$scope.pouchdb.put(task);
    }
  

  $scope.remaining = function () {
    var count = 0;
    angular.forEach($scope.tasks, function (task) {
      count += task.done ? 0 : 1;
    });
    return count;
  };

  $scope.removeDone = function () {
    var oldtasks = $scope.tasks;
    $scope.tasks = [];
    angular.forEach(oldtasks, function (task) {
      if (!task.done) {
        $scope.tasks.push(task);
      }
      else {
        $scope.removeTask(task);
      }
    });
  };

  $scope.removeTask = function (task) {
    $scope.pouchdb.get(task._id, function (err, doc) {
      if (err) {
        console.log(err);
      }
      else {
        $scope.pouchdb.remove(doc, function (err, response) {
          console.log(response);
        });
      }
    });
  };
}


var editer = angular.module('editer', []);
var app = angular.module('app', []);

//Credit for ngBlur and ngFocus to https://github.com/addyosmani/taskmvc/blob/master/architecture-examples/angularjs/js/directives/
editer.directive('ngBlur', function() {
  return function( scope, elem, attrs ) {
    elem.bind('blur', function() {
      scope.$apply(attrs.ngBlur);
    });
  };
});

editer.directive('ngFocus', function( $timeout ) {
  return function( scope, elem, attrs ) {
    scope.$watch(attrs.ngFocus, function( newval ) {
      if ( newval ) {
        $timeout(function() {
          elem[0].focus();
        }, 0, false);
      }
    });
  };
});

function reloadPage() {
    location.reload();
}
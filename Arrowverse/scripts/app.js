var app = angular.module('arrowverseApp', []);

app.controller('arrowverseController', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
    $scope.episodes = [];
    $scope.watched = [];
    var now = new Date()
    $scope.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var limit = localStorage.getItem('limit')
    if (!limit)
        $scope.limit = 20;
    else
        $scope.limit = parseInt(limit);

    $scope.$watch("limit", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            localStorage.setItem('limit', newValue);
        }
    });

    $scope.Init = function () {     
        var episodesSource = "arrowverse.json?v=" + Date.now().valueOf();
        $http.get(episodesSource).then(function (result) {
            if (result && result.data) {
                var data = result.data;

                $scope.episodes = data.episodes;
                $scope.watched = data.watched;
                setTimeout(function () {
                    var _elemH = $('table tr.watched').last().offset().top;
                    window.scrollTo(0, _elemH);
                }, 100);
            }
        }, function (err) {
            console.error(err);
        });
    }

    $scope.isWatched = function (episode) {
        if ($scope.watched && episode) {
            var _identifier = $filter('identifier')(episode);
            return $scope.watched.indexOf(_identifier) > -1;
        }
        return false;
    }

    $scope.isFuture = function (episode) {
        if (episode) {
            return new Date(episode.date) >= $scope.today;
        }
        return false;
    }

    $scope.setAllWatched = function () {
        angular.forEach($scope.episodes, function (episode) {
            var _identifier = $filter('identifier')(episode);

            $scope.watched.push(_identifier);

            $scope.saveWatched(angular.toJson($scope.watched));
        });
    }

    $scope.setWatched = function (episode) {
        if (episode) {
            var _identifier = $filter('identifier')(episode);

            if ($scope.isWatched(episode)) {
                var index = $scope.watched.indexOf(_identifier);
                $scope.watched.splice(index, 1);
            }
            else {
                $scope.watched.push(_identifier);
            }
            $scope.SaveAll();
        } 
    }

    $scope.fetchEpisodesList = function () {
        console.log('fetching episodes...');
        $.getJSON('http://anyorigin.com/go?url=http%3A//flash-arrow-order.herokuapp.com/hide/supergirl+vixen+constantine/&callback=?', function (data) {
            var $table = $(data.contents).find("#episode-list tbody")
            var $tableRows = $table.children();
            var _data = [];

            for (var i = 0; i <= $tableRows.length; i++) {
                var $currentTableRow = $tableRows[i];
                if ($currentTableRow) {

                    var _series = $currentTableRow.children[1].innerText;

                    if ($scope.acceptedShow($filter('flatten')(_series))) {
                        _data.push({
                            order: parseInt($currentTableRow.children[0].innerText),
                            series: _series,
                            episode: $currentTableRow.children[2].innerText,
                            title: $currentTableRow.children[3].innerText,
                            dateString: $currentTableRow.children[4].innerText,
                            date: new Date($currentTableRow.children[4].innerText),
                        });
                    }
                }
            }

            $scope.episodes = _data;
            $scope.SaveAll();
            console.log('fetched episodes completed!');

            setTimeout(function () {
                $scope.Init();
                $scope.$apply
            }, 200);
        });
    }
    
    $scope.SaveAll = function (episodesJson) {
        var data = {
            watched: $scope.watched,
            episodes: $scope.episodes
        };

        var fd = new FormData();
        fd.append('json', angular.toJson(data));

        $http.post("SaveArrowverse.php", fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined, 'Process-Data': false }
        }).then(function () {
            console.log("OK");
        }, function (err) {
            console.log(err);
        });
    }

    $scope.acceptedShow = function (series) {
        return (series === "arrow" || series === "the_flash" || series === "dcs_legends_of_tomorrow")
    }

    $scope.Init();
}]);


app.filter('identifier', function ($filter) {
    return function (episode) {
        if (episode) {
            return $filter('flatten')(episode.series) + "_" + episode.episode;
        }
        return null;
    }
});

app.filter('flatten', function () {
    return function (string) {
        if (string) {
            return string.replace('\'', '').toLowerCase().replace(/ /g, "_").replace(':', '');
        }
        return string;
    }
});
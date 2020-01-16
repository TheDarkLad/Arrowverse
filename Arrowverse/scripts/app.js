var app = angular.module('arrowverseApp', []);

app.controller('arrowverseController', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
    $scope.series = typeof(series) != 'undefined' ? series : '';    

    // declare variables 
    $scope.episodes = [];
    $scope.watched = [];
    $scope.fetchingEpisodesList = false;
    // Set date variables
    var now = new Date()
    $scope.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    $scope.historyDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).addDays(7);
    $scope.acceptedShow = [];

    // episodes states
    $scope.isWatched = function (episode) {
        if ($scope.watched && episode) {
            var _identifier = $filter('identifier')(episode);
            return $scope.watched.indexOf(_identifier) > -1;
        }
        return false;
    }

    $scope.isHistory = function (episode) {
        if ($scope.isWatched(episode)) {
            return new Date(episode.date) <= $scope.historyDate;
        }
        return false;
    }

    $scope.isFuture = function (episode) {
        if (episode) {
            return new Date(episode.date) >= $scope.today;
        }
        return false;
    }

    // Events
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

    // Get episodes
    $scope.fetchEpisodesList = function () {
        // Accepted shows
        $scope.acceptedShow = ["arrow", "the_flash", "dcs_legends_of_tomorrow"];
        console.log('fetching episodes...');
        $scope.fetchingEpisodesList = true;
        $.getJSON('https://api.allorigins.win/get?url='+ encodeURIComponent('https://flash-arrow-order.herokuapp.com/?newest_first=False&hide_show=constantine&hide_show=freedom-fighters&hide_show=supergirl&hide_show=vixen&hide_show=black-lightning&from_date=&to_date='), function (data) {
            var $table = $(data.contents).find("#episode-list tbody")
            var $tableRows = $table.children();
            var _data = [];

            for (var i = 0; i <= $tableRows.length; i++) {
                var $currentTableRow = $tableRows[i];
                if ($currentTableRow) {

                    var _series = $currentTableRow.children[1].innerText;

                    if ($scope.acceptedShow.indexOf($filter('flatten')(_series)) > -1) {
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
                $scope.loadEpisodes();
                $scope.fetchingEpisodesList = false;
                $scope.$apply
            }, 200);
        });
    }

    // Save data
    $scope.SaveAll = function () {
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

    // Init the application
    $scope.loadEpisodes = function () {
        var episodesSource = "";
        if($scope.series === "arrowverse"){
            var episodesSource = "arrowverse.json"
        }
        else if($scope.series === "clonewars"){
            var episodesSource = "clonewars.json"
        }

        episodesSource += "?v=" + Date.now().valueOf();

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

    $scope.Init = function () {
        $scope.loadEpisodes();
    }();
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

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
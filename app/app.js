var app = angular.module('seriesProgressApp', []);

app.controller('seriesProgressController', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
    $scope.data = typeof(data) != 'undefined' ? data : {}
    // declare variables 
    $scope.episodes = [];
    $scope.watched = [];
    $scope.fetchingEpisodesList = false;
    // Set date variables
    var now = new Date()
    $scope.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    $scope.historyDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).addDays(7);

    // returns wethers an episodes is marked as watched
    $scope.isWatched = function (episode) {
        if ($scope.watched && episode) {
            var _identifier = $filter('identifier')(episode);
            return $scope.watched.indexOf(_identifier) > -1;
        }
        return false;
    }

    // returns wethers an episode is in the past
    $scope.isHistory = function (episode) {
        if ($scope.isWatched(episode)) {
            return new Date(episode.date) <= $scope.historyDate;
        }
        return false;
    }

    // returns wethers an episode is in the future
    $scope.isFuture = function (episode) {
        if (episode) {
            return new Date(episode.date) >= $scope.today;
        }
        return false;
    }

    // adds an episode to the watched list
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
            $scope.SaveData();
        }
    }

    // Gets new Arrowverse episodes
    $scope.fetchArrowverseEpisodesList = function () {
        // Accepted shows
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

                    if ($scope.data.includedShows.indexOf($filter('flatten')(_series)) > -1) {
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
            $scope.SaveData();
            console.log('fetched episodes completed!');

            setTimeout(function () {
                $scope.loadEpisodes();
                $scope.fetchingEpisodesList = false;
                $scope.$apply
            }, 200);
        });
    }

    // Saves that data
    $scope.SaveData = function () {
        var data = {
            watched: $scope.watched,
            episodes: $scope.episodes
        };

        var fd = new FormData();
        fd.append('path', "../series/" + $scope.data.currentSeries + ".json")
        fd.append('json', angular.toJson(data));

        $http.post("../app/save.php", fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined, 'Process-Data': false }
        }).then(function () {
            console.log("OK");
        }, function (err) {
            console.log(err);
        });
    }

    // loads the data 
    $scope.loadData = function () {
        var episodesSource = $scope.data.currentSeries + ".json?v=" + Date.now().valueOf();

        $http.get(episodesSource).then(function (result) {
            if (result && result.data) {
                var data = result.data;
                $scope.episodes = data.episodes;
                $scope.watched = data.watched;

                for (let index = 0; index < $scope.episodes.length; index++) {
                    const element = $scope.episodes[index];
                    element.disc = parseInt(element.disc);
                    element.order = parseInt(element.order);   
                }
                $scope.SaveData();

                setTimeout(function () {
                    if($('table tr.watched').last().length){
                        var _elemH = $('table tr.watched').last().offset().top;
                        window.scrollTo(0, _elemH);
                    }
                }, 100);
            }
        }, function (err) {
            console.error(err);
        });
    }

    $scope.Init = function () {
        $scope.loadData();
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
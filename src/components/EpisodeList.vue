<template>
<div>
    <div v-if="currentSeries.fetchEpisodesUrl">
        <input type="button" class="button" @click="fetchEpisodes()" value="Fetch Episodes" />
        <div class="loader" v-show="fetchingEpisodesList"></div>
    </div>
    <table border="0" v-if="!fetchingEpisodesList">
        <thead>
            <tr>
                <th>&nbsp;</th>
                <th v-for="col in currentSeries.columns" :key="col.property" v-html="col.label"></th>                 
            </tr>
        </thead>
        <tbody>
            <tr v-for="episode in orderedEpisodes" v-bind:class="getClass(episode)" :key="episode.order">
                <td>
                    <input type="checkbox" 
                    :checked="isWatched(episode)" @click="setWatched(episode)" />
                </td>
                <td v-for="col in currentSeries.columns" :key="col.property" v-html="episode[col.property]"></td>
            </tr>
        </tbody>
    </table>
</div>
</template>
<script>
import shared from './../shared';
const now = new Date()

export default{
    mixins:[shared],
    computed:{
        orderedEpisodes(){
            let orderedEpisodes = this.episodes;
            if(orderedEpisodes) {
                orderedEpisodes = orderedEpisodes.sort((a, b) => 
                    a.order > b.order ? 1 : -1
                );
            }
            return orderedEpisodes;
        },
        
    },
    data(){
        return{
            currentSeries: {},
            episodes: [],
            watched: [],
            historyDate: undefined,
            today: undefined,
            fetchingEpisodesList: false
        }
    },
    methods:{
        async fetchEpisodes(){
            // Accepted shows
            console.log('fetching episodes...');
            this.fetchingEpisodesList = true;
            await this.$http.get(this.currentSeries.fetchEpisodesUrl).then((reponse) => {
                let data = reponse.data;
                var parser = new DOMParser();
                var doc = parser.parseFromString(data.contents, "text/html");
                
                let _data = this.currentSeries.parseFetchedEpisodes(doc);                
                console.log(_data);
                this.episodes = _data;
                console.log('fetched episodes completed!');
                this.fetchingEpisodesList = false;
            });   

            await this.saveData();
            
            this.getData();
        },
        isWatched(episode) {
            if (this.watched && episode) {
                let _identifier = this.getIdentifier(episode);
                return this.watched.indexOf(_identifier) > -1;
            }
            return false;
        },
        isHistory(episode) {
            if (this.isWatched(episode)) {
                return new Date(episode.date) <= this.historyDate;
            }
            return false;
        },
        isFuture(episode) {
            if (episode) {
                return new Date(episode.date) >= this.today;
            }
            return false;
        },
        getClass(episode){
            let _class = `series ${this.flatten(episode.series)}`;
            if(this.isWatched(episode)){
                _class += " watched";
            }
            if(this.isHistory(episode)){
                _class += " history";
            }
            if(this.isFuture(episode)){
                _class += " episode";
            }
            return _class;
        },
        setWatched(episode) {
            if (episode) {
                    let _identifier = this.getIdentifier(episode);

                if (this.isWatched(episode)) {
                    let index = this.watched.indexOf(_identifier);
                    this.watched.splice(index, 1);
                }
                else {
                    this.watched.push(_identifier);
                }
                this.saveData();
            }
        },
        saveData(){
            let data = {
                watched: this.watched,
                episodes: this.episodes
            };

            var fd = new FormData();
            let episodesSource = `data/${this.currentSeries.name}.json`;

            fd.append('path', episodesSource)
            fd.append('json', JSON.stringify(data));

            this.$http.post(this.saveUrl, fd).then(() => {
                this.$notify({
                    group: "foo",
                    title: "Save",
                    text: "Data was saved"
                });
            });
        },
        getData(){
            let episodesSource = `data/${this.currentSeries.name}.json?v=${Date.now().valueOf()}`;
            this.$http.get(episodesSource).then((result) => {
                if (result && result.data) {
                    let data = result.data;
                    this.episodes = data.episodes;
                    this.watched = data.watched;
                    
                    this.$nextTick(function () {
                        let nodes = document.querySelectorAll("tr.watched");
                        var elm = nodes[nodes.length - 1];
                        if(elm)
                            elm.scrollIntoView();
                    })
                }
            });
        },
    },            
    mounted(){
        this.historyDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).addDays(7);
        this.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        this.currentSeries = this.series.find(s => s.name === this.$route.params.series);
        if( this.currentSeries){
            this.getData();
            document.getElementById("icon").href = `${this.rootPath}/data/${this.currentSeries.name}.ico`;
            document.title = this.currentSeries.title;
        }
    }
}

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}
</script>
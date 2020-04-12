export default{
    data(){
        return{
            series:[{    
                    name: "arrowverse",
                    title: "Arrowverse",
                    includedShows:["arrow", "the_flash", "dcs_legends_of_tomorrow"],
                    columns:[
                        { label: '#', property:'order' },
                        { label: 'Series', property:'series' },
                        { label: 'Episode', property:'episode' },
                        { label: 'Title', property:'title' },
                        { label: 'Date', property:'dateString' },
                    ],
                    fetchEpisodesUrl: `https://api.allorigins.win/get?url=${encodeURIComponent('https://flash-arrow-order.herokuapp.com/?newest_first=False&hide_show=constantine&hide_show=freedom-fighters&hide_show=supergirl&hide_show=vixen&hide_show=black-lightning&from_date=&to_date=')}`,
                    parseFetchedEpisodes(doc){
                        let $table = doc.querySelector("#episode-list tbody");
                        let $tableRows = $table.children;
                        var _data = [];
        
                        for (var i = 0; i <= $tableRows.length; i++) {
                            let $currentTableRow = $tableRows[i];
                            if ($currentTableRow) {
                                let _series = $currentTableRow.children[1].innerText;
                                let _identifier = _series.replace('\'', '').toLowerCase().replace(/ /g, "_").replace(':', '');
                                if (this.includedShows.indexOf(_identifier) > -1) {
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
                        return _data;
                    }
                },
                {    
                    name: "theclonewars",
                    title: "The Clone Wars",
                    includedShows:[],
                    columns:[
                        { label: '#', property:'order' },
                        { label: 'Episode', property:'episode' },
                        { label: 'Disc', property:'disc' },
                        { label: 'Title', property:'title' },
                        { label: 'Arc', property:'arc' },
                    ]
                },
            ],
        }
    },    
    methods:{
        getIdentifier(episode){
            if (episode) {
                return this.flatten(episode.series) + "_" + episode.episode;
            }
            return episode;
        },
        flatten(input){
            if (input) {
                return input.replace('\'', '').toLowerCase().replace(/ /g, "_").replace(':', '');
            }
            return input;
        },
    },
    computed: {
        rootPath() {
            let root = window.location.origin;
            if (window.location.pathname && window.location.pathname !== "/") {
                root += window.location.pathname;
            }
            return root;
        },
        saveUrl() {
            return this.rootPath + "/save.php";
        },
    }
}
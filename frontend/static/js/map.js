const map = {
    init: (mapId) => {
        map.mapId = mapId;

        map.sizeToWindow();
        let resizeTimer;
        window.onresize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(map.sizeToWindow, 10);
        }

        map.lMap = L.map(mapId).setView([40.725, -73.95], 12);

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: MAPBOX_API_TOKEN,
        }).addTo(map.lMap);

        $.get('/static/geo/subway.geojson', (linesData) => {
            $.get('/static/geo/line-colors.csv', (colorData) => {
                const geoJson = JSON.parse(linesData);
                const colors = {};
                for (const row of colorData.split('\n')) {
                    const parts = row.split(',');
                    colors[parts[0]] = parts[1];
                }
                L.geoJSON(geoJson, {
                    style: (feature) => {
                        return {
                            color: `#${colors[feature.properties.rt_symbol]}`,
                            weight: 4,
                        }
                    },
                }).addTo(map.lMap);
            });
        });
    },

    sizeToWindow: () => {
        $(`#${map.mapId}`).height(window.innerHeight);
    },
};

// Initialize the map on document ready.
$(() => { map.init('map') });

const MAPBOX_API_TOKEN = 'pk.eyJ1IjoibW1jbGFyIiwiYSI6ImNqb2tibWV1azAwdjIzcGs2eDA5bzc1bnoifQ.JSAiw2PXJelrGfjQLBah6Q';
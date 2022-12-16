const map = {
    init: (mapId) => {
        map.mapId = mapId;
        map.zeroTime = Math.floor(new Date() / 1000);

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
                $('#time-slider').on('change', map.timeSliderChange);
                map.timeSliderChange();
            });
        });
    },

    updateTrainLocations: (timestamp) => {
        $.get({
            url: `/api/train-locations/${timestamp}`,
            success: (data) => {
                const icons = $.map(data.trains, (train) => {
                    const location = [
                        train.prev_stop.lat - (train.next_stop.lat - train.prev_stop.lat) * train.pct,
                        train.prev_stop.lon - (train.next_stop.lon - train.prev_stop.lon) * train.pct,
                    ];
                    return L.marker(location).bindPopup(train.rt_trip_id);
                });
                if (data.trains.length === 1) {
                    icons.push(L.marker([data.trains[0].prev_stop.lat, data.trains[0].prev_stop.lon], {
                        icon: L.divIcon({html: 'AYYY'})
                    }));
                }
                const newTrainLayer = L.layerGroup(icons);
                if (map.trainLayer) {
                    map.trainLayer.removeFrom(map.lMap);
                }
                newTrainLayer.addTo(map.lMap);
                map.trainLayer = newTrainLayer;
            },
        });
    },

    sizeToWindow: () => {
        $(`#${map.mapId}`).height(window.innerHeight);
    },

    timeSliderChange: () => {
        const minOffset = $('#time-slider').val();
        const timestamp = map.zeroTime + minOffset * 10;
        map.updateTrainLocations(timestamp);
    }
};

// Initialize the map on document ready.
$(() => { map.init('map') });

const MAPBOX_API_TOKEN = 'pk.eyJ1IjoibW1jbGFyIiwiYSI6ImNqb2tibWV1azAwdjIzcGs2eDA5bzc1bnoifQ.JSAiw2PXJelrGfjQLBah6Q';
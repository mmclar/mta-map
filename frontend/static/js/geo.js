const combineLineStrings = (lineStrings) => {
    const combined = [];
    for (a of lineStrings) {
        combined.push(a);
        for (b of lineStrings) {
            if  (a.geometry.coordinates.slice(-1) === b.geometry.coordinates[[0]]) {
                a.geometry.coordinates.push(b.geometry.coordinates);
            }
        }
    }
    console.log(combined);
    for (lineString of lineStrings) {
        [start, end] = [lineString[0], lineString.slice(-1)];
    }
};
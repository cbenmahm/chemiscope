function toJson(path, buffer) {
    let text;
    if (path.endsWith(".gz")) {
        text = pako.inflate(buffer, {to: "string"});
    } else {
        const decoder = new TextDecoder("utf-8");
        text = decoder.decode(buffer);
    }

    // Allow NaN in the JSON file. They are not part of the spec, but
    // Python's json module output them, and they can be usefull.
    return JSON.parse(text.replace(/\bNaN\b/g, '"***NaN***"'), function(key, value) {
        return value === "***NaN***" ? NaN : value;
    });
}

let vizualizer = undefined;
function setupChemiscope(dataset) {
    if (vizualizer !== undefined) {
        vizualizer.changeDataset(dataset)
    } else {
        vizualizer = new Chemiscope.DefaultVizualizer({
            map:       'chemiscope-map',
            info:      'chemiscope-info',
            structure: 'chemiscope-structure',
            j2sPath:   GLOBAL_JS2_PATH,
        }, dataset)

        vizualizer.structure.settingsPlacement((rect) => {
            const structureRect = document.getElementById('chemiscope-structure').getBoundingClientRect();

            return {
                top: structureRect.top,
                left: structureRect.left - rect.width - 25,
            };
        })

        vizualizer.map.settingsPlacement((rect) => {
            const mapRect = document.getElementById('chemiscope-map').getBoundingClientRect();

            return {
                top: mapRect.top,
                left: mapRect.left + mapRect.width + 25,
            };
        })
    }
}

function displayError(error) {
    const display = document.getElementById('error-display');
    display.style.display = "block";
    display.getElementsByTagName('p')[0].innerText = error.toString();
    const backtrace = display.getElementsByTagName('details')[0];
    backtrace.getElementsByTagName('p')[0].innerText = error.stack;
}

function displayWarning(message) {
    const display = document.getElementById('warning-display');
    display.style.display = "block";
    display.getElementsByTagName('p')[0].innerText = message;
}

function loadExample(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw Error(`unable to load file at ${url}`)
            } else {
                return response.arrayBuffer();
            }
        })
        .then(buffer => toJson(url, buffer))
        .then(json => setupChemiscope(json))
        .catch(error => displayError(error));
}

function setupDefaultChemiscope(isStandalone) {
    Chemiscope.addWarningHandler((message) => displayWarning(message));

    window.onerror = (msg, url, line, col, error) => {
        displayError(error);
    }

    const upload = document.getElementById('upload');
    upload.onchange = () => {
        const name = upload.files[0].name;
        const reader = new FileReader();
        reader.onload = () => {
            const json = toJson(name, reader.result);
            setupChemiscope(json);
        }
        reader.readAsArrayBuffer(upload.files[0]);
    }

    if (isStandalone) {
        document.getElementById('examples').style.display = 'none';
        window.GLOBAL_JS2_PATH = 'https://chemapps.stolaf.edu/jmol/jsmol-2019-10-30/j2s/';
    } else {
        window.GLOBAL_JS2_PATH = 'static/js/jsmol/j2s';
    }
}
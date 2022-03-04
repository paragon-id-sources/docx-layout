function GetHeaders() { return $(":header").toArray(); }
function GetHeaderIndentLevel(header) { return String(header).replace(/^\D+/g, ''); }
function GenerateGUID() { return "nav-" + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16) ); }
function ScrollToID(id) { document.getElementById(String(id).replace(" ", "-")).scrollIntoView(); }

function GenerateJSON() {
    var headerData = []
    var headers = GetHeaders();
    headers.forEach(element => {
        let obj = {
            text: element.textContent,
            id: element.id,
            guid: GenerateGUID(),
            level: GetHeaderIndentLevel(element.tagName)
        }
        headerData.push(obj)
    });

    return getTree(headerData)
}

function pushToTree(obj, tree) {
    tree[obj.level - 1].children = tree[obj.level - 1].children || [];
    tree[obj.level - 1].children.push(obj);
    tree[obj.level] = obj;
    return tree
}

function getTree(array) {
    var rootTree = [{ text: "Headers", level: "0", guid: "base" }]
    var levels = [{}];
    var tmpLevel = 0
    array.forEach(function (o) {
        levels.length = o.level;

        if(o.level - tmpLevel > 1) {
            // o.level = String(parseInt(o.level) - (parseInt(tmpLevel) + 1))
            for (let index = tmpLevel; index < parseInt(o.level) + 1; index++) {
                let obj = {
                    text: "undefined",
                    id: "undefined-" + GenerateGUID(),
                    guid: GenerateGUID(),
                    level: GetHeaderIndentLevel(index)
                }
                levels = pushToTree(obj, levels)                        
            }
        }
        levels = pushToTree(o, levels)

        tmpLevel = o.level
    });
    rootTree[0].children = levels[0].children

    SetParentIDs(rootTree[0]);

    return rootTree[0];
}

// Recursively set a GUID on every single document of its parent 
function SetParentIDs(array) {
    if(array.guid == null) { array.guid = "base"}
    array.children.forEach(function (child) {
        child.parent = array.guid
        if(child.children != null) { SetParentIDs(child); }
    })
}

function parseJSONToNav(jsn) {
    var result = ""

    if(jsn.children == null) { 
        return `<li><a id="${jsn.guid}"class="link-dark rounded">${jsn.text}</a></li>` 
    }

    jsn.children.forEach(function(object) {
        if(object.children == null) {
            if(object.parent == "base") {
                result += `<li><button onclick="ScrollToID('${object.id}')" class="btn btn-toggle-no-icon"ata-bs-toggle="collapse" aria-expanded="false"> ${object.text}</button></li>`
                return result;
            }
            result += `<li><a onclick="ScrollToID('${object.id}')" class="link-dark rounded">${object.text}</a></li>` 
            return result; 
        }

        result += `<li class="mb-1">`;
        result += `<button class="btn btn-toggle align-items-center rounded collapsed" data-bs-toggle="collapse" data-bs-target="#${object.guid}-collapse" aria-expanded="false">`;
        result += `${object.text}`;
        result += `</button>`;
        result += `<div class="collapse" id="${object.guid}-collapse">`;
        result += `<ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">`;
        result += parseJSONToNav(object)
        result += `</ul>`
        result += `</div>`
        result += `</li>`
    });

    return result;
}

window.onload = function () {
    console.log(GenerateJSON())
    document.getElementById('navigator').innerHTML = parseJSONToNav(GenerateJSON());

};



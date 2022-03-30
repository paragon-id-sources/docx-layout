try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { mermaid.initialize({ 'theme': 'dark' }); }
} catch (error) {
    console.error("Failed to theme mermaid.")
    console.error(error)
}

function GetHeaders() { return document.querySelectorAll("h1, h2, h3, h4, h5, h6"); }
function GetHeaderIndentLevel(header) { return String(header).replace(/^\D+/g, ''); }
function GenerateGUID() { return "nav-" + ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }
function ScrollToID(id) { document.getElementById(String(id).replace(" ", "-")).scrollIntoView(); }

function SetTheme(theme) {
    try {
        document.documentElement.className = theme
        localStorage.setItem('theme', theme);
    } catch (error) {
        console.error(`Failed to theme document with theme '${theme}'.`)
        console.error(error)
    }
}

function GenerateJSON() {
    let headerData = [];
    let headers = GetHeaders();

    // Iterate over each `h` tag in the html
    // Assign text, id, guid and level
    // 
    // text : text of the tag
    // id : id of the tag
    // guid : unique id of the object. This is so we can directly find the parent and for dropdowns to function appropriately
    // level : the number the h tag is. i.e h1 is level 1; h2 is level 2, etc
    headers.forEach(element => {
        let obj = {
            text: element.textContent,
            id: element.id,
            guid: GenerateGUID(),
            level: GetHeaderIndentLevel(element.tagName)
        };
        headerData.push(obj);
    });

    return getTree(headerData);
};

function pushToTree(obj, tree) {
    // create object at a level higher than the children
    tree[obj.level - 1].children = tree[obj.level - 1].children || [];

    // push all children to this level object
    tree[obj.level - 1].children.push(obj);

    // set higher level object to the true parent
    tree[obj.level] = obj;
    return tree;
};

// Generate tree children
function getTree(array) {
    // Create a root object to declare where the tree begins
    let rootTree = [{ text: "Headers", level: "0", guid: "base" }];
    let levels = [{}];

    // temp level to compare previous iteration over the last one
    // we use this to handle improper headers, e.g `h1 -> h2 -> h4`
    // there is a h3 missing, which would cascade through the children in the tree
    let tmpLevel = 0
    array.forEach(function (o) {
        levels.length = o.level;

        // If current object has a level difference of previous object greater than one
        if (o.level - tmpLevel > 1) {
            // o.level = String(parseInt(o.level) - (parseInt(tmpLevel) + 1))

            // create new blank level for each level which is missing
            for (let index = tmpLevel; index < parseInt(o.level) + 1; index++) {
                let obj = {
                    text: "undefined",
                    id: "undefined-" + GenerateGUID(),
                    guid: GenerateGUID(),
                    level: GetHeaderIndentLevel(index)
                }
                levels = pushToTree(obj, levels);
            }
        }
        levels = pushToTree(o, levels);

        tmpLevel = o.level;
    });

    // set all new children to the root layer of the tree
    rootTree[0].children = levels[0].children;

    // sets all "guid parents" appropriately
    SetParentIDs(rootTree[0]);

    return rootTree[0];
};

// Recursively go through each child of tree, and add "parent" guid to refer to
// We use the object parent guid to construct the sidebar and properly link dropdown toggles
// This allows us to know level, and parent, without having to compare to previous elements   
function SetParentIDs(array) {
    if (array.guid == null) { array.guid = "base" }
    array.children.forEach(function (child) {
        child.parent = array.guid
        if (child.children != null) { SetParentIDs(child); }
    })
};

function parseJSONToNav(jsn) {
    let result = "";

    if (jsn.children == null && jsn.text == null) { return `` }

    // Iterate over all children in object
    jsn.children.forEach(function (object) {

        // If object has no children
        // Create a clickable link to section, but do not make a dropdown as ther are no children
        if (object.children == null) {
            if (object.parent == "base") {
                // if part of base make a button, to differentiate between normal item with no children and a h1 heading
                result += `<li><button onclick="ScrollToID('${object.id}')" class="btn btn-sidebar btn-toggle-no-icon"ata-bs-toggle="collapse" aria-expanded="false"> ${object.text}</button></li>`
                result += `<div class="cst-border"></div>`
                return result;
            }
            result += `<li><a onclick="ScrollToID('${object.id}')" class="link-dark rounded">${object.text}</a></li>`
            return result;
        };


        // Create section for nav item and al children
        result += `<li class="mb-1">`;

        // Create dropdown button for nav item
        result += `<button class="btn btn-sidebar btn-toggle align-items-center rounded collapsed" data-bs-toggle="collapse" data-bs-target="#${object.guid}-collapse" aria-expanded="false">`;
        result += `${object.text}`;
        result += `</button>`;

        // Set collapse state
        result += `<div class="collapse" id="${object.guid}-collapse">`;
        result += `<ul class="btn-sidebar btn-toggle-nav list-unstyled fw-normal pb-1 small">`;

        // recursively add all children of section using this method
        result += parseJSONToNav(object)

        // Add finishing tags of section
        result += `</ul>`
        result += `</div>`
        result += `</li>`

        // Add seperator to each root item in nav bar
        result += object.level == 1 ? `<li class="cst-border"></li>` : ``
    });

    return result;
};

function ExpandAllNavItems() {
    let sidebar = document.getElementById("section-sidebar")
    let buttons = sidebar.getElementsByClassName("collapse");

    for (i = 0; i < buttons.length; i++) {
        buttons[i].classList.add("show")
    }
}

function CollapseAllNavItems() {
    let sidebar = document.getElementById("section-sidebar")
    let buttons = sidebar.getElementsByClassName("collapse")

    for (i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("show")
    }
}

// Generate sidebar on successful load
window.onload = function () {
    try {
        let footnoteDiv = document.getElementsByClassName("footnotes")
        if (footnoteDiv.length > 0) {
            let footnote = footnoteDiv[footnoteDiv.length - 1]
            footnote.insertAdjacentHTML('beforebegin', '<h1 id="footnote-section-div">Footnotes</h1>')
        }
    } catch (error) {
        console.error("Failed to generate footnotes.");
        console.error(error);
    }

    try {
        document.getElementById('navigator').innerHTML = parseJSONToNav(GenerateJSON());
    } catch (error) {
        console.error("Failed to generate sidebar.");
        console.error(error);
    }

    try {
        document.getElementsByClassName("sidebar")[0].classList.remove("bg-white");
    } catch (error) {
        console.error("Failed to remove class from sidebar.");
        console.error(error);
    }

    try {
        let theme = localStorage.getItem('theme');
        SetTheme(theme);
    } catch (error) {
        console.error("Failed to load theme from local storage.");
        console.error(error);
    }
};

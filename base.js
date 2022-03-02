function SanitateAsID(id) {
    return String(id).replace(" ", "-")
}
function GetHeaders() {
    return $(":header").toArray();
}

function GetHeaderIndentLevel(header) {
    return String(header).replace(/^\D+/g, '');
}

function GetTree() {
    var testdata = []
    var headers = GetHeaders();
    headers.forEach(element => {
        let obj = {
            text: element.textContent,
            rank: GetHeaderIndentLevel(element.tagName)
        }
        testdata.push(obj)
    });

    return getTree(testdata)

}

function ScrollToID(id) {
    id = String(id).replace(" ", "-")
    var x = document.getElementById(SanitateAsID(id));
    x.scrollIntoView();
}
function getTree(array) {
    var rootTree = [{ text: "Headers", rank: "0" }]
    var levels = [{}];
    array.forEach(function (o) {
        levels.length = o.rank;
        levels[o.rank - 1].children = levels[o.rank - 1].children || [];
        levels[o.rank - 1].children.push(o);
        levels[o.rank] = o;
    });
    rootTree[0].children = levels[0].children
    return rootTree[0];
}

function AddDropdownEvents() {
    let arrow = document.querySelectorAll(".arrow");
    for (var i = 0; i < arrow.length; i++) {
        arrow[i].addEventListener("click", (e) => {
            let arrowParent = e.target.parentElement.parentElement; //selecting main parent of arrow
            arrowParent.classList.toggle("showMenu");
        });
    }
}

var parseJsonAsHTMLTree = function (jsn) {
    result = ""
    if (jsn.text) {

        if (jsn.rank == 2) {
            return ``
        }

        if (jsn.children == null && jsn.rank == 1) {
            result += ""
                + `<li>`
                + `<a onclick="ScrollToID('${jsn.text.toLowerCase()}')">`
                + `<i class='bx bx-grid-alt' ></i>`
                + `<span class="link_name link-jumper" onclick="ScrollToID('${jsn.text.toLowerCase()}')">${jsn.text}</span>`
                + `</a>`
                + `</li>`
        }

        if (jsn.children != null) {
            if (parseInt(jsn.children.length) && jsn.rank <= 2) {
                result += ""
                    + `<li>`
                    + `<div class="icon-link">`
                    + `<a >`
                    + `<i class="bx bx-box"></i>`
                    + `<span class="link_name link-jumper" onclick="ScrollToID('${jsn.text.toLowerCase()}')">${jsn.text}</span>`
                    + `</a><i class="bx bxs-chevron-down arrow"></i></div>`
                    + `<ul class="sub-menu">`
                    + `<li>`
                    + `<a class="link_name">${jsn.text}</a>`
                    + `</li>`

                for (var i in jsn.children) {
                    if (jsn.children[i].rank == 2)
                        result += `<li class="sub-child"><a class="link-jumper" onclick="ScrollToID('${jsn.children[i].text.toLowerCase()}')">${jsn.children[i].text}</a></li>`

                }

                result += `</ul></li>`

                for (var i in jsn.children) {
                    result += parseJsonAsHTMLTree(jsn.children[i]);
                }
            }
        }
    }
    return result;
}

window.onload = function () {
    var treeRaw = GetTree()
    var result = '<div class=\"logo-details\"></div><ul class=\"nav-links\">';

    result += parseJsonAsHTMLTree(treeRaw);

    result += '</ul></div>';

    document.getElementById('result').innerHTML = result;

    AddDropdownEvents();

    var results = document.getElementById("result")
    var navLinks = results.getElementsByTagName("ul")[0]
    navLinks.removeChild(navLinks.getElementsByTagName('li')[0]);
};
var urlParams = new URLSearchParams(window.location.search);
var projectId = urlParams.get("project");
var funnelId = urlParams.get("funnel");
var pageId = urlParams.get("page");
var baseUrl = urlParams.get("api");
var pageType = urlParams.get("type");

// Styling selectors
var generalStyle = null;
var dimensionStyle = null;
var typographyStyle = null;
var decorationsStyle = null;
var extraStyle = null;
var flexStyle = null;
var settingsStyle = null;
var classesContainerStyle = null;
var easyPaddingStyle = null;
var easyMarginStyle = null;
var easyFontStyle = null;
var advancedStyles = {};
var easyStyles = {};

// To save attributes
var emailFormExternalUrl = null;
var stepFormExternalUrl = null;

// There are 2 tabs on style manager.
const styleTabs = { general: "general", advanced: "advanced" };
var selectedStyleTab = styleTabs.general;

// Padding value storage
var paddingTop = "";
var paddingBottom = "";
var paddingLeft = "";
var paddingRight = "";

function showAdvancedTab() {
    selectedStyleTab = styleTabs.advanced;

    $(".gjs-sm-sector.advanced").css("opacity", "1");
    $(".gjs-sm-sector.general").css("opacity", "0.5");

    Object.values(advancedStyles).forEach(style => (style.display = "block"));
    Object.values(easyStyles).forEach(style => (style.display = "none"));
    let elements = document.querySelectorAll('div[title="Href"]');
    for (const element of elements) {
        element.setAttribute("title", "URL");
        element.innerHTML = "URL";
    }
}

async function initializeEditor() {
    let styleManager = `
 <svg style="display: block;" viewBox="0 0 24 24">
    <path fill="currentColor"
          d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z"></path>
</svg>`;
    let layers = `
    <svg style="display: block;" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z"></path>
      </svg>  
  `;
    let blocks = `
    <svg style="display: block;" viewBox="0 0 24 24">
          <path fill="currentColor" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"></path>
    </svg>
  `;

    localStorage.removeItem("gjsProject");

    const sessionToken = localStorage.getItem("sessionToken");
    const page = await (
        await fetch(`${baseUrl}/pages/${pageId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`,
            },
        })
    ).json();
    if (!page.contentUrl) {
        return;
    }

    let pageContent = "";
    if (page.jsonUrl) {
        const jsonContent = await (await fetch(page.jsonUrl)).json();
        localStorage.setItem("gjsProject", JSON.stringify(jsonContent));
    } else {
        pageContent = await (await fetch(page.contentUrl)).text();
    }

    localStorage.setItem(pageId + "_extraHead", page.extraHead || "");
    localStorage.setItem(pageId + "_extraBody", page.extraBody || "");

    var plp = "https://placehold.co/350x250/";
    var images = [
        plp + "78c5d6/fff",
        plp + "459ba8/fff",
        plp + "79c267/fff",
        plp + "c5d647/fff",
        plp + "f28c33/fff",
        plp + "e868a2/fff",
        plp + "cc4360/fff",
    ];

    const customComponentTypes = editor => {
        const dropdown = "dropdown";
        const nextPage = "Go to next funnel step";
        const externalSite = "Go to website URL";

        editor.DomComponents.addType("hamburger-menu", {
            isComponent: el => {
                if (
                    el.tagName === "div" &&
                    el.classList.contains("hamburger-menu")
                ) {
                    return { type: "hamburger-menu" };
                }
            },
            model: {
                defaults: {
                    tagName: "div",
                    name: "hamburger-menu",
                    attributes: {
                        id: "hamburgerMenu",
                        class: "hamburger-menu",
                    },
                    styles: `
            .navbar {
                display: flex;
                justify-content: flex-end;
                background-color: #444;
                padding: 10px;
            }
    
            .navbar-items a {
                color: white;
                text-decoration: none;
                padding: 10px;
                margin: 0 5px;
                transition: background-color 0.3s;
            }
    
            .navbar-items a:hover {
                background-color: #555;
            }
    
            .menu-icon {
                display: none;
                cursor: pointer;
                font-size: 24px;
                color: white;
            }
    
            @media screen and (max-width: 768px) {
                .navbar a {
                    display: none;
                }
                
                .navbar {
                  justify-content: space-between;
                }
    
                .menu-icon {
                    display: block;
                    order: 1;
                }
    
                .responsive {
                    flex-direction: column;
                }
    
                .responsive a {
                    display: block;
                    text-align: center;
                }
            }
          `,
                    components: `
            <div class="navbar" id="navbar">
              <div class="navbar-items" id="navbar-items"></div>
              <div class="menu-icon" id="menu-icon">&#9776;</div>
            </div>
          `,
                    script: function () {
                        const menu = [];
                        const navbarItems =
                            document.getElementById("navbar-items");
                        const menuIcon = document.getElementById("menu-icon");

                        const toggleMenu = event => {
                            event.preventDefault();
                            navbarItems.classList.toggle("responsive");
                        };
                        menuIcon.onclick = toggleMenu;

                        function populateMenu(menuItems) {
                            navbarItems.innerHTML = "";
                            menuItems.forEach(mi => {
                                navbarItems.innerHTML += `<a href="${mi.path}">${mi.title}</a>`;
                            });
                        }

                        const urlParams = new URLSearchParams(
                            window.location.search
                        );
                        const funnelId = urlParams.get("funnel");
                        const baseUrl = urlParams.get("api");

                        if (!baseUrl || !funnelId) {
                            populateMenu(menu);
                        } else {
                            fetch(`${baseUrl}/funnels/${funnelId}/menus`)
                                .then(response => response.json())
                                .then(data => {
                                    if (data?.length) {
                                        const menuItems = data?.length
                                            ? data.map(menuItem => ({
                                                  title: menuItem.title,
                                                  path: menuItem.path,
                                              }))
                                            : menu;
                                        populateMenu(menuItems);
                                    } else {
                                        populateMenu(menu);
                                    }
                                })
                                .catch(() => {
                                    populateMenu(menu);
                                });
                        }
                    },
                },
            },
        });
        const saveSectionButton = {
            attributes: { class: "fa fa-save" },
            command: function (e) {
                const sessionToken = localStorage.getItem("sessionToken");
                let component = e.getSelected();
                const json = component.toJSON();
                const css = e.CodeManager.getCode(component, "css", {
                    cssc: e.CssComposer,
                });
                json.style = css;
                const modal = editor.Modal;
                modal.setTitle("Save Section");
                modal.setContent(`
          <div id="modalTabs" class="modal-tabs">
            <div id="headView" class="views">
              <label for="sectionTitle" style="width: 100%; display: block; text-align: center; margin-bottom: 6px;">What would you like to name this section?</label>
              <input id="sectionTitle" placeholder="Section name" class="modal-textarea" style="height: 50px"></input>
            </div>
          </div>
          <div class="modal-button-container">
          <button id="closeModal" class="modal-button" style="margin-right: 10px; background: transparent; border: 1px solid #eee; color: #eee;">Cancel</button>
            <button id="modalButton" class="modal-button">Save Section</button>
          </div>
        `);
                let title;
                const closeButton = document.getElementById("closeModal");
                const modalButton = document.getElementById("modalButton");
                closeButton.addEventListener("click", function () {
                    modal.close();
                });
                modalButton.addEventListener("click", function () {
                    const sectionTitle =
                        document.getElementById("sectionTitle");
                    title = sectionTitle.value;
                    if (!title) {
                        return alert("Please provide a name.");
                    }
                    const body = JSON.stringify({ section: json, title });
                    document.getElementById("saving-overlay").style.display =
                        "block";
                    fetch(`${baseUrl}/sections`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${sessionToken}`,
                        },
                        body,
                    })
                        .catch(err => console.error(err))
                        .finally(() => {
                            document.getElementById(
                                "saving-overlay"
                            ).style.display = "none";
                            loadSavedSections(editor, sessionToken);
                        });
                    modal.close();
                });
                modal.open();
            },
        };

        editor.DomComponents.addType("email-form", {
            isComponent: el => {
                if (
                    el.tagName === "FORM" &&
                    el.classList.contains("contact-form")
                ) {
                    const result = { type: "email-form" };
                    return result;
                }
            },
            model: {
                defaults: {
                    tagName: "form",
                    name: "contact-form",
                    attributes: {
                        id: "emailForm",
                        class: "contact-form",
                    },
                    styles: `
            .contact-outer-wrapper {
              box-sizing: border-box;
              display: flex;
              flex-wrap: nowrap;
              padding: 10px;
              margin-top: 10px;
              margin-bottom: 10px;
              padding-left: calc((100% - 1200px) / 2);
              padding-right: calc((100% - 1200px) / 2);
              justify-content: center;
              align-items: center;
            }
            .contact-inner-wrapper {
              box-sizing: border-box;
              min-height: 75px;
              flex-grow: 1;
              flex-basis: 100%;
              margin-top: 10px;
              margin-bottom: 10px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background-repeat: repeat;
              background-position: left top;
              background-attachment: scroll;
              background-size: auto;
              background-image: linear-gradient(#eeeeee 0%, #eeeeee 100%);
              max-width: 500px;
              padding: 15px 25px 15px 25px;
              border-radius: 10px 10px 10px 10px;
              border: 1px solid #cbcbcb;
            }
            .contact-inner-wrapper > input {
              box-sizing: border-box;
              margin-top: 10px;
              margin-bottom: 10px;
              width: 100%;
              padding: 15px 15px 15px 15px;
              border-radius: 4px 4px 4px 4px;
              border: 1px solid #cbcbcb;
              font-size: 18px;
            }
            .contact-inner-wrapper > button {
              box-sizing: border-box;
              margin-top: 10px;
              margin-bottom: 10px;
              width: 100%;
              border: 0px solid white;
              background-repeat: repeat;
              background-position: left top;
              background-attachment: scroll;
              background-size: auto;
              background-image: linear-gradient(#4e56ff 0%, #4e56ff 100%);
              color: white;
              padding: 15px 15px 15px 15px;
              border-radius: 4px 4px 4px 4px;
              font-size: 20px;
              cursor: pointer;
              box-shadow: 2px 2px 4px 0px rgba(0,0,0,0.1);
            }
            .contact-inner-wrapper > button:hover {
              box-sizing: border-box;
              margin-top: 10px;
              margin-bottom: 10px;
              width: 100%;
              border: 0px solid white;
              color: white;
              padding: 15px 15px 15px 15px;
              border-radius: 4px 4px 4px 4px;
              font-size: 20px;
              background-repeat: repeat;
              background-position: left top;
              background-attachment: scroll;
              background-size: auto;
              background-image: linear-gradient(#a0a4ff 0%, #a0a4ff 100%);
              cursor: pointer;
              box-shadow: 2px 2px 4px 0px rgba(0,0,0,0.1);
            }
          `,
                    components: `<div class="contact-outer-wrapper">
              <div class="contact-inner-wrapper">
                <input type="text" id="inputName" name="contact[name]" placeholder="Full Name..." required />
                <input type="email" id="inputEmail" name="contact[email]" placeholder="Email Address..." required />
                <button type="submit">Submit</button>
              </div>
            </div>`,
                    traits: [
                        // {
                        //   type: 'href-next',
                        //   name: 'data-url',
                        //   label: 'Request URL',
                        //   placeholder: 'Insert URL',
                        // },
                        {
                            type: "select",
                            name: dropdown,
                            label: "Action",
                            default: nextPage,
                            options: [
                                { id: nextPage, name: nextPage },
                                { id: externalSite, name: externalSite },
                            ],
                        },
                    ],
                    script: function () {
                        localStorage.removeItem("formSubmissionThrottle");

                        const form = this;
                        form.addEventListener("submit", function (event) {
                            event.preventDefault();

                            if (
                                localStorage.getItem("formSubmissionThrottle")
                            ) {
                                return;
                            }
                            localStorage.setItem(
                                "formSubmissionThrottle",
                                true
                            );
                            setTimeout(() => {
                                localStorage.removeItem(
                                    "formSubmissionThrottle"
                                );
                            }, 1000);

                            const url = this.attributes["data-url"]
                                ? this.attributes["data-url"].value
                                : "";
                            const email = form.querySelector(
                                '[name="contact[email]"]'
                            ).value;
                            const name = form.querySelector(
                                '[name="contact[name]"]'
                            ).value;

                            if (url) {
                                if (url.trim() === "") {
                                    alert("Please add post request url");
                                    return;
                                }
                                const regex = new RegExp(
                                    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
                                );

                                if (regex.test(url) === false) {
                                    alert("Invaliid post request url");
                                    return;
                                }

                                fetch(url, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        email,
                                        name,
                                    }),
                                })
                                    .then(response => response.text())
                                    .then(data => {
                                        // alert('API Response: ' + JSON.stringify(data));
                                    })
                                    .catch(error => {
                                        console.error("Error:", error);
                                        alert("Error: " + error.message);
                                    });
                            }

                            const parsedUrl = new URL(window.location.href);
                            const apiUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
                            const modelAttributes = this.attributes;

                            fetch(apiUrl + "/contacts", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    email,
                                    name,
                                    url: window.location.href,
                                }),
                            })
                                .then(response => {
                                    const url = window.location.href;
                                    const json = modelAttributes["externalUrl"]
                                        ? JSON.stringify(
                                              modelAttributes["externalUrl"]
                                                  .value
                                          )
                                        : '""';
                                    const externalUrl = JSON.parse(json);

                                    if (externalUrl) {
                                        window.location.href = externalUrl;
                                    } else {
                                        fetch(apiUrl + `/funnels/nextPage`, {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                url,
                                            }),
                                        })
                                            .then(response => response.json())
                                            .then(nextPage => {
                                                if (nextPage) {
                                                    let nextPageUrl =
                                                        window.location.href.substring(
                                                            0,
                                                            url.lastIndexOf("/")
                                                        ) +
                                                        "/" +
                                                        (nextPage.path || "");
                                                    window.location.href =
                                                        nextPageUrl;
                                                }
                                            })
                                            .catch(error =>
                                                console.error("error", error)
                                            );
                                    }
                                })
                                .catch(error => {
                                    console.error("Error:", error);
                                    alert("Error: " + error.message);
                                });
                        });
                    },
                },
                init() {
                    this.on(
                        `change:attributes:${dropdown}`,
                        this.handleChangeDropdown(false)
                    );

                    if (!this.getAttributes()[dropdown]) {
                        // if no option selected, set default option
                        this.getAttributes()[dropdown] = nextPage;
                    }

                    this.handleChangeDropdown(true)(this);
                },
                handleChangeDropdown: editorOpenedFirst => model => {
                    const externalUrl = "externalUrl";

                    if (model.getAttributes()[dropdown] === nextPage) {
                        emailFormExternalUrl =
                            model.attributes.attributes[externalUrl];
                        model.attributes.attributes[externalUrl] = "";
                        model.removeTrait(externalUrl);
                    } else if (
                        model.getAttributes()[dropdown] === externalSite
                    ) {
                        !editorOpenedFirst &&
                            (model.attributes.attributes[externalUrl] =
                                emailFormExternalUrl);
                        model.addTrait({
                            id: externalUrl,
                            name: externalUrl,
                            label: "Website URL",
                            placeholder: "https://www.google.com",
                        });
                    }
                },
            },
        });
        const domc = editor.DomComponents;
        const defaultType = domc.getType("default");

        editor.DomComponents.addType("button-link", {
            isComponent: el => {
                if (
                    el.tagName === "a" &&
                    el.classList.contains("button-link")
                ) {
                    const result = { type: "button-link" };
                    return result;
                }
            },
            model: {
                defaults: {
                    tagName: "a",
                    editable: true,
                    name: "button-link",
                    style: {
                        "margin-top": "10px",
                        "margin-bottom": "10px",
                        "margin-left": "auto",
                        "margin-right": "auto",
                        "padding": "10px",
                        "text-align": "center",
                        "display": "block",
                        "width": "fit-content",
                        "min-width": "50px",
                        "min-height": "30px",
                        "text-decoration": "none",

                        "background-image": "linear-gradient(#4e56ff 0%, #4e56ff 100%)", 
                        "color": "white",
                        "padding": "15px 15px 15px 15px",
                        "border-radius": "4px 4px 4px 4px",
                        "font-size": "20px",
                        "font-family": "Arial",
                        "cursor": "pointer",
                        "box-shadow": "2px 2px 4px 0px rgba(0,0,0,0.1)",
                    },
                    attributes: {
                        class: "button-link",
                    },
                    traits: [
                        {
                            name: "href",
                            label: "URL",
                            placeholder: "https://google.com",
                        },
                    ],
                    components: `Headline`,
                },
            },
            extend: "text",
        });

        editor.DomComponents.addType("image-link", {
            extend: "link",
            model: {
                defaults: {
                    resizable: true,
                    style: {
                        display: "inline-block",
                        padding: "0px",
                        "min-height": "50px",
                        "min-width": "50px",
                        overflow: "hidden",
                    },
                    traits: [
                        {
                            name: "href",
                            label: "URL",
                            placeholder: "https://google.com",
                        },
                    ],
                    components: {
                        selectable: false,
                        resizable: false,
                        hoverable: false,
                        type: "image",
                        style: {
                            width: '100%',
                            height: '100%'
                        }
                    },
                },
            },
        });

        editor.DomComponents.addType("full-width-section", {
            isComponent: el => {
                if (
                    el.tagName === "div" &&
                    el.classList.contains("full-width-section")
                ) {
                    const result = { type: "full-width-section" };
                    return result;
                }
            },
            view: defaultType.view.extend({
                events: {
                    click: "handleClick",
                    dblclick: function (ev) {
                        editor.Panels.getButton("views", "open-sm").set(
                            "active",
                            false
                        );
                        editor.Panels.getButton("views", "open-layers").set(
                            "active",
                            false
                        );
                        editor.Panels.getButton("views", "open-blocks").set(
                            "active",
                            true
                        );
                    },
                },
                handleClick: function (ev) {
                    editor.Panels.getButton("views", "open-sm").set(
                        "active",
                        false
                    );
                    editor.Panels.getButton("views", "open-layers").set(
                        "active",
                        false
                    );
                    editor.Panels.getButton("views", "open-blocks").set(
                        "active",
                        true
                    );
                },
            }),
            model: {
                defaults: {
                    tagName: "div",
                    editable: true,
                    badgable: false,
                    hoverable: false,
                    droppable: false,
                    name: "Section",
                    draggable: (target, destination) => {
                        if (destination.attributes.tagName === "body")
                            return true;
                        return false;
                    },
                    toolbar: [
                        saveSectionButton,
                        {
                            attributes: { class: "fa fa-arrows" },
                            command: "tlb-move",
                        },
                        {
                            attributes: { class: "fa fa-trash" },
                            command: "tlb-delete",
                        },
                    ],
                    attributes: {
                        class: "full-width-section gjs-row",
                    },
                    styles: `.full-width-section { width: 100% }`,
                    components: [
                        {
                            tagName: "div",
                            editable: true,
                            selectable: true,
                            badgable: false,
                            hoverable: false,
                            draggable: false,
                            droppable: false,
                            name: "Cell",
                            attributes: {
                                class: "gjs-cell full-width-cell",
                            },
                            style: {
                                "padding-top": "30px",
                                "padding-bottom": "30px",
                                "padding-left": "30px",
                                "padding-right": "30px",
                            },
                            styles: `.full-width-cell { display: flex; justify-content: center; align-items: center; }`,
                            components: [
                                {
                                    tagName: "div",
                                    editable: true,
                                    selectable: true,
                                    badgable: false,
                                    hoverable: false,
                                    draggable: false,
                                    droppable: false,
                                    name: "Row",
                                    attributes: {
                                        class: "gjs-row full-width-row",
                                    },
                                    styles: `.full-width-row { width: 100%; }`,
                                    components: [
                                        {
                                            tagName: "div",
                                            editable: true,
                                            selectable: true,
                                            draggable: ["gjs-row"],
                                            name: "Cell",
                                            attributes: {
                                                class: "gjs-cell",
                                            },
                                            style: {
                                                "padding-top": "30px",
                                                "padding-bottom": "30px",
                                                "padding-left": "30px",
                                                "padding-right": "30px",
                                            },
                                            styles: `
                      .gjs-cell:empty:after { 
                        content: "+";
                        font-weight: bold;
                        font-size: 36px;
                        color: white;
                        align-items: center;
                        justify-content: center;
                        display: flex;
                        background-color: #45433f;
                        border-radius: 2rem;
                        height: 100%;
                        width: 100%;
                      }`,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
        });

        editor.DomComponents.addType("wide-width-section", {
            isComponent: el => {
                if (
                    el.tagName === "div" &&
                    el.classList.contains("wide-width-section")
                ) {
                    const result = { type: "wide-width-section" };
                    return result;
                }
            },
            view: defaultType.view.extend({
                events: {
                    click: "handleClick",
                    dblclick: function (ev) {
                        editor.Panels.getButton("views", "open-sm").set(
                            "active",
                            false
                        );
                        editor.Panels.getButton("views", "open-layers").set(
                            "active",
                            false
                        );
                        editor.Panels.getButton("views", "open-blocks").set(
                            "active",
                            true
                        );
                    },
                },
                handleClick: function (ev) {
                    editor.Panels.getButton("views", "open-sm").set(
                        "active",
                        false
                    );
                    editor.Panels.getButton("views", "open-layers").set(
                        "active",
                        false
                    );
                    editor.Panels.getButton("views", "open-blocks").set(
                        "active",
                        true
                    );
                },
            }),
            model: {
                defaults: {
                    tagName: "div",
                    editable: true,
                    droppable: true,
                    badgable: false,
                    hoverable: false,
                    draggable: (target, destination) => {
                        if (destination.attributes.tagName === "body")
                            return true;
                        return false;
                    },
                    name: "Section",
                    attributes: {
                        class: "wide-width-section gjs-row",
                    },
                    styles: `.wide-width-section { width: 100% }`,
                    toolbar: [
                        saveSectionButton,
                        {
                            attributes: { class: "fa fa-arrows" },
                            command: "tlb-move",
                        },
                        {
                            attributes: { class: "fa fa-trash" },
                            command: "tlb-delete",
                        },
                    ],
                    components: [
                        {
                            tagName: "div",
                            editable: true,
                            selectable: true,
                            draggable: false,
                            droppable: false,
                            badgable: false,
                            hoverable: false,
                            name: "Cell",
                            attributes: {
                                class: "gjs-cell wide-width-cell",
                            },
                            style: {
                                "padding-top": "30px",
                                "padding-bottom": "30px",
                                "padding-left": "30px",
                                "padding-right": "30px",
                            },
                            styles: `.wide-width-cell { display: flex; justify-content: center; align-items: center; }`,
                            components: [
                                {
                                    tagName: "div",
                                    editable: true,
                                    selectable: true,
                                    draggable: false,
                                    droppable: false,
                                    badgable: false,
                                    hoverable: false,
                                    name: "Row",
                                    attributes: {
                                        class: "gjs-row wide-width-row",
                                    },
                                    styles: `.wide-width-row { width: 100%; }`,
                                    components: [
                                        {
                                            tagName: "div",
                                            editable: true,
                                            selectable: true,
                                            draggable: ["gjs-row"],
                                            name: "Cell",
                                            attributes: {
                                                class: "gjs-cell",
                                            },
                                            style: {
                                                "padding-top": "30px",
                                                "padding-bottom": "30px",
                                                "padding-left": "30px",
                                                "padding-right": "30px",
                                            },
                                            styles: `
                      .gjs-cell:empty:after { 
                        content: "+";
                        font-weight: bold;
                        font-size: 36px;
                        color: white;
                        align-items: center;
                        justify-content: center;
                        display: flex;
                        background-color: #45433f;
                        border-radius: 2rem;
                        height: 100%;
                        width: 100%;
                      }`,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
        });

        editor.DomComponents.addType("medium-width-section", {
            isComponent: el => {
                if (
                    el.tagName === "div" &&
                    el.classList.contains("medium-width-section")
                ) {
                    const result = { type: "medium-width-section" };
                    return result;
                }
            },
            view: defaultType.view.extend({
                events: {
                    click: "handleClick",
                    dblclick: function (ev) {
                        editor.Panels.getButton("views", "open-sm").set(
                            "active",
                            false
                        );
                        editor.Panels.getButton("views", "open-layers").set(
                            "active",
                            false
                        );
                        editor.Panels.getButton("views", "open-blocks").set(
                            "active",
                            true
                        );
                    },
                },
                handleClick: function (ev) {
                    editor.Panels.getButton("views", "open-sm").set(
                        "active",
                        false
                    );
                    editor.Panels.getButton("views", "open-layers").set(
                        "active",
                        false
                    );
                    editor.Panels.getButton("views", "open-blocks").set(
                        "active",
                        true
                    );
                },
            }),
            model: {
                defaults: {
                    tagName: "div",
                    editable: true,
                    droppable: true,
                    badgable: false,
                    hoverable: false,
                    draggable: (target, destination) => {
                        if (destination.attributes.tagName === "body")
                            return true;
                        return false;
                    },
                    name: "Section",
                    attributes: {
                        class: "medium-width-section gjs-row",
                    },
                    styles: `.medium-width-section { width: 100% }`,
                    toolbar: [
                        saveSectionButton,
                        {
                            attributes: { class: "fa fa-arrows" },
                            command: "tlb-move",
                        },
                        {
                            attributes: { class: "fa fa-trash" },
                            command: "tlb-delete",
                        },
                    ],
                    components: [
                        {
                            tagName: "div",
                            editable: true,
                            selectable: true,
                            draggable: false,
                            droppable: false,
                            badgable: false,
                            hoverable: false,
                            name: "Cell",
                            attributes: {
                                class: "gjs-cell medium-width-cell",
                            },
                            style: {
                                "padding-top": "30px",
                                "padding-bottom": "30px",
                                "padding-left": "30px",
                                "padding-right": "30px",
                            },
                            styles: `.medium-width-cell { display: flex; justify-content: center; align-items: center; }`,
                            components: [
                                {
                                    tagName: "div",
                                    editable: true,
                                    selectable: true,
                                    draggable: false,
                                    droppable: false,
                                    badgable: false,
                                    hoverable: false,
                                    name: "Row",
                                    attributes: {
                                        class: "gjs-row medium-width-row",
                                    },
                                    styles: `.medium-width-row { width: 100%; }`,
                                    components: [
                                        {
                                            tagName: "div",
                                            editable: true,
                                            selectable: true,
                                            draggable: ["gjs-row"],
                                            name: "Cell",
                                            attributes: {
                                                class: "gjs-cell",
                                            },
                                            style: {
                                                "padding-top": "30px",
                                                "padding-bottom": "30px",
                                                "padding-left": "30px",
                                                "padding-right": "30px",
                                            },
                                            styles: `
                      .gjs-cell:empty:after { 
                        content: "+";
                        font-weight: bold;
                        font-size: 36px;
                        color: white;
                        align-items: center;
                        justify-content: center;
                        display: flex;
                        background-color: #45433f;
                        border-radius: 2rem;
                        height: 100%;
                        width: 100%;
                      }`,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
        });

        editor.DomComponents.addType("small-width-section", {
            isComponent: el => {
                if (
                    el.tagName === "div" &&
                    el.classList.contains("small-width-section")
                ) {
                    const result = { type: "small-width-section" };
                    return result;
                }
            },
            view: defaultType.view.extend({
                events: {
                    click: "handleClick",
                    dblclick: function (ev) {
                        editor.Panels.getButton("views", "open-sm").set(
                            "active",
                            false
                        );
                        editor.Panels.getButton("views", "open-layers").set(
                            "active",
                            false
                        );
                        editor.Panels.getButton("views", "open-blocks").set(
                            "active",
                            true
                        );
                    },
                },
                handleClick: function (ev) {
                    editor.Panels.getButton("views", "open-sm").set(
                        "active",
                        false
                    );
                    editor.Panels.getButton("views", "open-layers").set(
                        "active",
                        false
                    );
                    editor.Panels.getButton("views", "open-blocks").set(
                        "active",
                        true
                    );
                },
            }),
            model: {
                defaults: {
                    tagName: "div",
                    editable: true,
                    droppable: false,
                    badgable: false,
                    hoverable: false,
                    draggable: (target, destination) => {
                        if (destination.attributes.tagName === "body")
                            return true;
                        return false;
                    },
                    name: "Section",
                    attributes: {
                        class: "small-width-section gjs-row",
                    },
                    styles: `.small-width-section { width: 100% }`,
                    toolbar: [
                        saveSectionButton,
                        {
                            attributes: { class: "fa fa-arrows" },
                            command: "tlb-move",
                        },
                        {
                            attributes: { class: "fa fa-trash" },
                            command: "tlb-delete",
                        },
                    ],
                    components: [
                        {
                            tagName: "div",
                            editable: true,
                            selectable: true,
                            draggable: false,
                            droppable: false,
                            badgable: false,
                            hoverable: false,
                            name: "Cell",
                            attributes: {
                                class: "gjs-cell small-width-cell",
                            },
                            styles: `.small-width-cell { display: flex; justify-content: center; align-items: center; }`,
                            components: [
                                {
                                    tagName: "div",
                                    editable: true,
                                    selectable: true,
                                    draggable: false,
                                    droppable: false,
                                    badgable: false,
                                    hoverable: false,
                                    name: "Row",
                                    attributes: {
                                        class: "gjs-row small-width-row",
                                    },
                                    styles: `.small-width-row { width: 100%; }`,
                                    components: [
                                        {
                                            tagName: "div",
                                            editable: false,
                                            selectable: false,
                                            draggable: ["gjs-row"],
                                            name: "Cell",
                                            attributes: {
                                                class: "gjs-cell",
                                            },
                                            style: {
                                                "padding-top": "30px",
                                                "padding-bottom": "30px",
                                                "padding-left": "30px",
                                                "padding-right": "30px",
                                            },
                                            styles: `
                      .gjs-cell:empty:after { 
                        content: "+";
                        font-weight: bold;
                        font-size: 36px;
                        color: white;
                        align-items: center;
                        justify-content: center;
                        display: flex;
                        background-color: #45433f;
                        border-radius: 2rem;
                        height: 100%;
                        width: 100%;
                      }`,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
        });

        editor.DomComponents.addType("text-headline", {
            isComponent: el => {
                if (
                    el.tagName === "p" &&
                    el.classList.contains("text-headline")
                ) {
                    const result = { type: "text-headline" };
                    return result;
                }
            },
            model: {
                defaults: {
                    tagName: "p",
                    editable: true,
                    name: "text-headline",
                    style: {
                        width: "100%",
                        "font-size": "32px",
                        "font-weight": "bold",
                        "margin-top": "10px",
                        "margin-bottom": "10px",
                        "padding-top": "10px",
                        "padding-bottom": "10px",
                        "text-align": "center",
                        "font-family": "Arial, Helvetica, sans-serif",
                    },
                    attributes: {
                        id: "textHeadline",
                        class: "text-headline",
                    },
                    components: `Headline`,
                },
            },
            extend: "text",
        });

        editor.DomComponents.addType("text-subtitle", {
            isComponent: el => {
                if (
                    el.tagName === "p" &&
                    el.classList.contains("text-subtitle")
                ) {
                    const result = { type: "text-subtitle" };
                    return result;
                }
            },
            model: {
                defaults: {
                    tagName: "p",
                    editable: true,
                    name: "text-subtitle",
                    style: {
                        width: "100%",
                        "font-size": "23px",
                        "margin-top": "10px",
                        "margin-bottom": "10px",
                        "padding-top": "10px",
                        "padding-bottom": "10px",
                        "text-align": "center",
                        "font-family": "Arial, Helvetica, sans-serif",
                    },
                    attributes: {
                        id: "textSubtitle",
                        class: "text-subtitle",
                    },
                    components: `Subtitle`,
                },
            },
            extend: "text",
        });

        editor.DomComponents.addType("text-paragraph", {
            isComponent: el => {
                if (
                    el.tagName === "p" &&
                    el.classList.contains("text-paragraph")
                ) {
                    const result = { type: "text-paragraph" };
                    return result;
                }
            },
            model: {
                defaults: {
                    tagName: "p",
                    editable: true,
                    name: "text-paragraph",
                    attributes: {
                        id: "textParagraph",
                        class: "text-paragraph",
                    },
                    style: {
                        width: "100%",
                        "font-size": "16px",
                        "margin-top": "10px",
                        "margin-bottom": "10px",
                        "padding-top": "10px",
                        "padding-bottom": "10px",
                        "text-align": "center",
                        "font-family": "Arial, Helvetica, sans-serif",
                    },
                    components: `Paragraph`,
                },
            },
            extend: "text",
        });

        editor.DomComponents.addType("products-stepper", {
            isComponent: el => {
                if (
                    el.tagName === "FORM" &&
                    el.classList.contains("products-step")
                ) {
                    return { type: "products-stepper" };
                }
            },
            model: {
                defaults: {
                    tagName: "form",
                    name: "products-step",
                    attributes: {
                        id: "productsStep",
                        class: "products-step",
                    },
                    traits: [
                        // {
                        //   type: 'href-next',
                        //   name: 'data-url',
                        //   label: 'Request URL',
                        //   placeholder: 'Insert URL',
                        // },
                        {
                            type: "select",
                            name: dropdown,
                            default: nextPage,
                            label: "Action",
                            options: [
                                { id: nextPage, name: nextPage },
                                { id: externalSite, name: externalSite },
                            ],
                        },
                    ],
                    style: {
                        border: "1px solid #cbcbcb",
                        width: "500px",
                        margin: "10px auto",
                        "background-image":
                            "linear-gradient(#eeeeee 0%, #eeeeee 100%)",
                        "border-radius": "10px",
                    },
                    styles: `
           .wrapper {
              padding: 15px 25px;
           }
          .steps {
            display: flex;
            justify-content: space-between;
          }
          .product-step {
            width: 50%;
            text-align: center;
            font-size: 16px;
            font-family: Arial, Helvetica, sans-serif;
          }
          .tab-content {
            display: flex;
            flex-direction: column;
            padding: 8px;
          }
          input[type="text"], input[type="password"]  {
            box-sizing: border-box;
            margin-top: 10px;
            margin-bottom: 10px;
            width: 100%;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #cbcbcb;
            font-size: 18px;
            outline: none;
          }
          button {
            box-sizing: border-box;
            margin-top: 10px;
            margin-bottom: 10px;
            width: 100%;
            border: 0px solid white;
            background-repeat: repeat;
            background-position: left top;
            background-attachment: scroll;
            background-size: auto;
            background-image: linear-gradient(#4e56ff 0%, #4e56ff 100%);
            color: white;
            padding: 15px;
            border-radius: 4px;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 2px 2px 4px 0px rgba(0,0,0,0.1);
            outline: none;
          }
          button:disabled {
            opacity: 0.5;
          }
          #loadingIndicator {
            display: none;
            text-align: center;
            padding: 20px;
            font-weight: bold;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 18px;
          }
          #productList {
            margin-bottom: 16px;
            max-height: 180px;
            overflow: auto;
          }
          #productList > div {
            height: 32px;
          }
          #productList > p {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 18px;
          }
          #productList label {
            margin-left: 8px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 18px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          thead th {
            border-bottom: 2px solid #000;
          }
          tbody td {
            border: none;
          } 
          th, td {
            padding: 8px;
            text-align: left;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 18px;
          }
          th {
            color: black;
          }
          td {
            color: #333;
          }
        .progress-bar {
          height: 5px;
          background: #cbcbcb;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .progress {
          height: 100%;
          background: linear-gradient(#4e56ff 0%, #4e56ff 100%);;
          width: 50%;
          transition: width 0.4s ease;
        }
        .payment-card {
          border: 1px solid #cbcbcb;
          padding: 12px;
          border-radius: 4px;
        }
        .field-group {
          display: flex;
          justify-content: space-between;
        }
        .field-group .field {
          flex: 1;
          margin-right: 8px;
        }
        .field-group .field:last-child {
          margin-right: 0;
        }
        .field > label {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 18px;
        }
        #completeOrderBtn {
          width: 100%;
          margin-top: 16px;
        }
        .backBtn {
          text-align: left !important;
          font-size: 16px !important;
          font-family: Arial, Helvetica, sans-serif !important;
          margin-bottom: 16px !important;
        }
        `,
                    components: `
          <div class="steps">
          <div class="product-step active" data-tab="form-details">Basic</div>
          <div class="product-step" data-tab="products">Billing</div>
        </div>
          <div class="progress-bar">
            <div class="progress"></div>
          </div>
          <div class="wrapper">
            <div class="tab-content" id="form-details">
              <input type="text" id="name" name="name" placeholder="Full Name*" data-filed="info" />
              <input type="text" name="email" placeholder="Email*" data-filed="info" />
              <button type="button" id="nextBtn" disabled>Next</button>
            </div>
            <div class="tab-content" id="products" style="display:none;">
              <p id="backBtn" class="backBtn">Back</p>
              <div id="loadingIndicator">Loading...</div>
              <div id="productList"></div>
              <div class="payment-card">
                <div class="field">
                  <label for="cardNumber">Credit Card Number *</label>
                  <input type="text" id="cardNumber" name="cardNumber" placeholder="Card number" data-filed="card" />
                </div>
                <div class="field-group">
                  <div class="field">
                    <label for="expiry">Expiry *</label>
                    <input type="text" id="expiry" name="expiry" placeholder="MM/YY" data-filed="card" />
                  </div>
                  <div class="field">
                    <label for="cvc">CVC Code *</label>
                    <input type="password" id="cvc" name="cvc" placeholder="CVC" data-filed="card" />
                  </div>
                </div>
              </div>
              <div id="selectedProduct"></div>
              <button id="completeOrderBtn" disabled="true">Complete Order</button>
            </div>
          </div>
      `,
                    script: function () {
                        const form = this;
                        const paymentFormUrlParams = new URLSearchParams(
                            window.location.search
                        );
                        const paymentFormPageId =
                            paymentFormUrlParams.get("page");
                        const paymentFormBaseUrl =
                            paymentFormUrlParams.get("api");
                        let name = "";
                        let email = "";
                        let productsData = [];
                        let selectedProductData = null;
                        let cardNumber = "";
                        let expiry = "";
                        let cvc = "";
                        let userContactId = null;
                        let modelAttributes = this.attributes;

                        const updateProgressBar = step => {
                            const progressBar = form.querySelector(".progress");
                            if (step === "products") {
                                progressBar.style.width = "100%";
                            } else {
                                progressBar.style.width = "50%";
                            }
                        };

                        const formatCurrency = (value, currency) => {
                            if (isNaN(+value)) {
                                return value;
                            }

                            const formatter = new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: currency,
                            });

                            return formatter.format(value / 100);
                        };

                        const updateSelectedProduct = productId => {
                            selectedProductData = productsData.find(
                                product => product.id === productId
                            );
                            if (selectedProductData) {
                                const selectedProductDiv =
                                    form.querySelector("#selectedProduct");
                                selectedProductDiv.innerHTML = "";

                                const table = document.createElement("table");
                                table.style.width = "100%";

                                const thead = document.createElement("thead");
                                const headerRow = document.createElement("tr");
                                ["Name", "Price"].forEach(text => {
                                    const th = document.createElement("th");
                                    th.appendChild(
                                        document.createTextNode(text)
                                    );
                                    headerRow.appendChild(th);
                                });
                                thead.appendChild(headerRow);
                                table.appendChild(thead);

                                const tbody = document.createElement("tbody");
                                const dataRow = document.createElement("tr");

                                const nameCell = document.createElement("td");
                                nameCell.appendChild(
                                    document.createTextNode(
                                        selectedProductData.product.name
                                    )
                                );
                                dataRow.appendChild(nameCell);

                                const _value = formatCurrency(
                                    selectedProductData.unit_amount,
                                    selectedProductData.currency
                                );

                                const priceCell = document.createElement("td");
                                priceCell.appendChild(
                                    document.createTextNode(`${_value}`)
                                );
                                dataRow.appendChild(priceCell);

                                tbody.appendChild(dataRow);
                                table.appendChild(tbody);
                                selectedProductDiv.appendChild(table);

                                localStorage.setItem(
                                    "selectedProductData",
                                    JSON.stringify(selectedProductData)
                                );
                            }
                        };

                        const showLoadingIndicator = () => {
                            const loadingIndicator =
                                form.querySelector("#loadingIndicator");
                            loadingIndicator.style.display = "block";
                        };

                        const hideLoadingIndicator = () => {
                            const loadingIndicator =
                                form.querySelector("#loadingIndicator");
                            loadingIndicator.style.display = "none";
                        };

                        const fetchProducts = () => {
                            showLoadingIndicator();

                            let apiUrl;
                            if (paymentFormPageId && paymentFormBaseUrl) {
                                apiUrl = `${paymentFormBaseUrl}/pages/products?pageId=${paymentFormPageId}`;
                            } else {
                                const parsedUrl = new URL(window.location.href);
                                apiUrl = `${parsedUrl.protocol}//${parsedUrl.host}/pages/products?url=${encodeURIComponent(window.location.href)}`;
                            }

                            fetch(apiUrl, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            })
                                .then(res => res.json())
                                .then(({ result: products }) => {
                                    productsData.push(...products);
                                    const productListDiv =
                                        form.querySelector("#productList");
                                    if (!products?.length) {
                                        productListDiv.innerHTML =
                                            "<p>Products not found</p>";
                                        return;
                                    }
                                    productListDiv.innerHTML = "";
                                    let checkFirst = false;
                                    products.forEach(product => {
                                        const productDiv =
                                            document.createElement("div");
                                        const radioInput =
                                            document.createElement("input");
                                        const label =
                                            document.createElement("label");

                                        const _value = formatCurrency(
                                            product.unit_amount,
                                            product.currency
                                        );
                                        const interval = product?.recurring
                                            ?.interval
                                            ? `/ ${product?.recurring?.interval}`
                                            : "";
                                        radioInput.type = "radio";
                                        if (!checkFirst) {
                                            checkFirst = true;
                                            updateSelectedProduct(product.id);
                                            radioInput.checked = "true";
                                        }
                                        radioInput.name = "product";
                                        radioInput.value = product.id;
                                        radioInput.id = `product-${product.id}`;

                                        label.htmlFor = `product-${product.id}`;
                                        label.textContent = `${product.product.name} - ${_value} ${interval}`;

                                        label.addEventListener("click", () => {
                                            radioInput.checked = true;
                                            updateSelectedProduct(product.id);
                                        });

                                        productDiv.appendChild(radioInput);
                                        productDiv.appendChild(label);

                                        productListDiv.appendChild(productDiv);
                                    });
                                })
                                .catch(e => console.error(e, "error"))
                                .finally(hideLoadingIndicator);
                        };

                        const onChange = e => {
                            if (e.target.name === "name") {
                                name = e.target.value;
                            } else if (e.target.name === "email") {
                                email = e.target.value;
                            }

                            const isNameValid = name.length >= 3;
                            const isEmailValid =
                                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                            const nextBtn = form.querySelector("#nextBtn");
                            nextBtn.disabled = !(isNameValid && isEmailValid);
                        };

                        const inputs = form.querySelectorAll(
                            "input[data-filed='info']"
                        );
                        inputs.forEach(input => {
                            input.addEventListener("input", onChange);
                        });

                        const steps = form.querySelectorAll(".product-step");
                        const nextBtn = form.querySelector("#nextBtn");

                        localStorage.removeItem("formSubmissionThrottle");

                        nextBtn.addEventListener("click", event => {
                            event.preventDefault();

                            if (
                                localStorage.getItem("formSubmissionThrottle")
                            ) {
                                return;
                            }
                            localStorage.setItem(
                                "formSubmissionThrottle",
                                true
                            );
                            setTimeout(() => {
                                localStorage.removeItem(
                                    "formSubmissionThrottle"
                                );
                            }, 1000);

                            let nextStep;
                            steps.forEach(step => {
                                if (
                                    step.getAttribute("data-tab") === "products"
                                ) {
                                    nextStep = "products";
                                }
                            });

                            const tabContents =
                                form.querySelectorAll(".tab-content");
                            tabContents.forEach(tc => {
                                if (tc.id === "products") {
                                    tc.style.display = "block";
                                } else {
                                    tc.style.display = "none";
                                }
                            });

                            if (!paymentFormPageId) {
                                const contactsParsedUrl = new URL(
                                    window.location.href
                                );
                                const contactsApiUrl = `${contactsParsedUrl.protocol}//${contactsParsedUrl.host}`;
                                fetch(contactsApiUrl + "/contacts", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        email,
                                        name,
                                        url: window.location.href,
                                    }),
                                })
                                    .then(response => response.json())
                                    .then(res => (userContactId = res._id));
                            }

                            fetchProducts();
                            updateProgressBar(nextStep);
                        });

                        const showFormStep = () => {
                            const tabContents =
                                form.querySelectorAll(".tab-content");
                            tabContents.forEach(tc => {
                                if (tc.id === "form-details") {
                                    tc.style.display = "block";
                                } else {
                                    tc.style.display = "none";
                                }
                            });

                            updateProgressBar("form-details");
                        };

                        const backBtn = form.querySelector("#backBtn");
                        backBtn.addEventListener("click", () => showFormStep());

                        const isCardNumberValid = number => {
                            const numberLength = number.replace(
                                /\s+/g,
                                ""
                            ).length;
                            return numberLength >= 15 && numberLength < 20;
                        };

                        const isExpiryValid = expiry => {
                            const regex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
                            if (!regex.test(expiry)) {
                                return false;
                            }
                            const currentDate = new Date();
                            const month = parseInt(expiry.substring(0, 2), 10);
                            const year =
                                parseInt(expiry.substring(3), 10) + 2000;

                            return (
                                year > currentDate.getFullYear() ||
                                (year === currentDate.getFullYear() &&
                                    month >= currentDate.getMonth() + 1)
                            );
                        };

                        const isCvcValid = cvc =>
                            cvc.length === 3 || cvc.length === 4;

                        const onChangeCard = e => {
                            let value = e.target.value;

                            const currentYear = new Date()
                                .getFullYear()
                                .toString()
                                .substr(-2);

                            value = value.replace(/\D/g, "");

                            if (e.target.name === "cardNumber") {
                                if (value.length > 16) {
                                    value = value.substring(0, 16);
                                }
                                cardNumber = value;
                                e.target.value = value;
                            } else if (e.target.name === "expiry") {
                                if (value.length === 1 && parseInt(value) > 1) {
                                    value = "0" + value + "/";
                                } else if (value.length === 2) {
                                    const month = parseInt(value);
                                    if (month > 12 || month === 0) {
                                        value = "12/";
                                    } else {
                                        value += "/";
                                    }
                                } else if (value.length > 2) {
                                    if (value.length > 4) {
                                        value = value.substring(0, 4);
                                    }
                                    const monthPart = value.substring(0, 2);
                                    let yearPart = value.substring(2);
                                    if (yearPart.length === 2) {
                                        if (
                                            parseInt(yearPart) <
                                            parseInt(currentYear)
                                        ) {
                                            yearPart = currentYear;
                                        }
                                        value = monthPart + "/" + yearPart;
                                    } else if (yearPart.length === 1) {
                                        if (
                                            parseInt(yearPart) <
                                            parseInt(
                                                currentYear.substring(0, 1)
                                            )
                                        ) {
                                            yearPart = currentYear.substring(
                                                0,
                                                1
                                            );
                                        }
                                        value = monthPart + "/" + yearPart;
                                    }
                                }
                                expiry = value;
                                e.target.value = value;
                            } else if (e.target.name === "cvc") {
                                if (value.length > 4) {
                                    value = value.substring(0, 4);
                                }
                                cvc = value;
                                e.target.value = value;
                            }

                            let loadedSelectedProductData = null;
                            try {
                                loadedSelectedProductData = JSON.parse(
                                    localStorage.getItem("selectedProductData")
                                );
                            } catch (err) {
                                console.error("err=", err);
                                return false;
                            }
                            const completeBtn =
                                form.querySelector("#completeOrderBtn");
                            completeBtn.disabled = !(
                                loadedSelectedProductData &&
                                isCardNumberValid(cardNumber) &&
                                isExpiryValid(expiry) &&
                                isCvcValid(cvc)
                            );
                        };

                        const cardInputs = form.querySelectorAll(
                            "input[data-filed='card']"
                        );
                        cardInputs.forEach(input => {
                            input.addEventListener("input", onChangeCard);
                        });

                        const completeBtn =
                            form.querySelector("#completeOrderBtn");

                        localStorage.removeItem("formSubmissionThrottle");

                        completeBtn.addEventListener("click", async event => {
                            event.preventDefault();

                            if (paymentFormPageId && paymentFormBaseUrl) {
                                return;
                            }

                            if (
                                localStorage.getItem("formSubmissionThrottle")
                            ) {
                                return;
                            }
                            localStorage.setItem(
                                "formSubmissionThrottle",
                                true
                            );
                            setTimeout(() => {
                                localStorage.removeItem(
                                    "formSubmissionThrottle"
                                );
                            }, 1000);

                            try {
                                completeBtn.disabled = true;

                                const loadedSelectedProductData = JSON.parse(
                                    localStorage.getItem("selectedProductData")
                                );

                                const paymentMethod = await fetch(
                                    "https://api.stripe.com/v1/payment_methods",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type":
                                                "application/x-www-form-urlencoded",
                                            "Stripe-Account":
                                                loadedSelectedProductData.accountId,
                                            Authorization: `Bearer ${public_stripe_key}`,
                                        },
                                        body: new URLSearchParams({
                                            type: "card",
                                            "card[number]": cardNumber,
                                            "card[exp_month]": `${expiry[0] === "0" ? expiry.substring(1, 2) : expiry.split("/")[0]}`,
                                            "card[exp_year]": `20${expiry.split("/")[1]}`,
                                            "card[cvc]": cvc,
                                            "metadata[name]": name,
                                            "metadata[email]": email,
                                        }),
                                    }
                                );

                                const paymentMethodData =
                                    await paymentMethod.json();

                                if (paymentMethodData) {
                                    const paymentData = {
                                        url: window.location.href,
                                        contactId: userContactId,
                                        priceId: loadedSelectedProductData.id,
                                        paymentId: paymentMethodData.id,
                                        accountId:
                                            loadedSelectedProductData.accountId,
                                        type: loadedSelectedProductData.type,
                                        productName:
                                            loadedSelectedProductData.product
                                                .name,
                                    };

                                    const parsedUrl = new URL(
                                        window.location.href
                                    );
                                    const apiUrl = `${parsedUrl.protocol}//${parsedUrl.host}/user/payment`;

                                    const payment = await fetch(apiUrl, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(paymentData),
                                    });

                                    const paymentRes = await payment.json();

                                    const json = modelAttributes["externalUrl"]
                                        ? JSON.stringify(
                                              modelAttributes["externalUrl"]
                                                  .value
                                          )
                                        : '""';
                                    const externalUrl = JSON.parse(json);

                                    if (externalUrl) {
                                        window.location.href = externalUrl;
                                    } else {
                                        // go to next step in funnel
                                        const parsedUrl2 = new URL(
                                            window.location.href
                                        );
                                        const apiUrl2 = `${parsedUrl2.protocol}//${parsedUrl2.host}`;
                                        const url = window.location.href;
                                        const nextPageRes = await fetch(
                                            apiUrl2 + `/funnels/nextPage`,
                                            {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type":
                                                        "application/json",
                                                },
                                                body: JSON.stringify({
                                                    url,
                                                }),
                                            }
                                        );
                                        const nextPage =
                                            await nextPageRes.json();
                                        if (nextPage) {
                                            let nextPageUrl =
                                                window.location.href.substring(
                                                    0,
                                                    url.lastIndexOf("/")
                                                ) +
                                                "/" +
                                                (nextPage.path || "");
                                            window.location.href = nextPageUrl;
                                        }
                                    }
                                }
                            } catch (error) {
                                console.error("Error:", error);
                                completeBtn.disabled = false;
                            }
                        });
                    },
                },
                init() {
                    this.on(
                        `change:attributes:${dropdown}`,
                        this.handleChangeDropdown(false)
                    );

                    if (!this.getAttributes()[dropdown]) {
                        // if no option selected, set default option
                        this.getAttributes()[dropdown] = nextPage;
                    }

                    this.handleChangeDropdown(true)(this);
                },
                handleChangeDropdown: editorOpenedFirst => model => {
                    const externalUrl = "externalUrl";

                    if (model.getAttributes()[dropdown] === nextPage) {
                        stepFormExternalUrl =
                            model.attributes.attributes[externalUrl];
                        model.attributes.attributes[externalUrl] = "";
                        model.removeTrait(externalUrl);
                    } else if (
                        model.getAttributes()[dropdown] === externalSite
                    ) {
                        !editorOpenedFirst &&
                            (model.attributes.attributes[externalUrl] =
                                stepFormExternalUrl);
                        model.addTrait({
                            id: externalUrl,
                            name: externalUrl,
                            label: "Website URL",
                            placeholder: "https://upwork.com",
                        });
                    }
                },
            },
        });
    };

    var customFonts = [
        {
            font: "Open Sans",
            url: "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap",
        },
        {
            font: "Montserrat",
            url: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Roboto",
            url: "https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i&subset=latin,latin-ext",
        },
        {
            font: "Lato",
            url: "https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap",
        },
        {
            font: "Poppins",
            url: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
        },
        {
            font: "Inter",
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
        },
        {
            font: "Roboto Condensed",
            url: "https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Roboto Mono",
            url: "https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap",
        },
        {
            font: "Oswald",
            url: "https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap",
        },
        {
            font: "Noto Sans",
            url: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Raleway",
            url: "https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Playfair Display",
            url: "https://fonts.googleapis.com/css2?family=Playfair:ital,opsz,wght@0,5..1200,300..900;1,5..1200,300..900&display=swap",
        },
        {
            font: "Nunito Sans",
            url: "https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap",
        },
        {
            font: "Ubuntu",
            url: "https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap",
        },
        {
            font: "Nunito",
            url: "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap",
        },
        {
            font: "Rubik",
            url: "https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap",
        },
        {
            font: "Merriweather",
            url: "https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap",
        },
        {
            font: "Roboto Slab",
            url: "https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100..900&display=swap",
        },
        {
            font: "PT Sans",
            url: "https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap",
        },
        {
            font: "Kanit",
            url: "https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
        },
        {
            font: "Work Sans",
            url: "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Lora",
            url: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap",
        },
        {
            font: "Fira Sans",
            url: "https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
        },
        {
            font: "Mulish",
            url: "https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap",
        },
        {
            font: "DM Sans",
            url: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap",
        },
        {
            font: "Quicksand",
            url: "https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap",
        },
        {
            font: "Inconsolata",
            url: "https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&display=swap",
        },
        {
            font: "Barlow",
            url: "https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
        },
        {
            font: "IBM Plex Sans",
            url: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap",
        },
        {
            font: "PT Serif",
            url: "https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap",
        },
        {
            font: "Titillium Web",
            url: "https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap",
        },
        {
            font: "Manrope",
            url: "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap",
        },
        {
            font: "Noto Serif",
            url: "https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Heebo",
            url: "https://fonts.googleapis.com/css2?family=Heebo:wght@100..900&display=swap",
        },
        {
            font: "Libre Franklin",
            url: "https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Karla",
            url: "https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,200..800;1,200..800&display=swap",
        },
        {
            font: "Nanum Gothic",
            url: "https://fonts.googleapis.com/css2?family=Nanum+Gothic&display=swap",
        },
        {
            font: "Josefin Sans",
            url: "https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap",
        },
        {
            font: "Mukta",
            url: "https://fonts.googleapis.com/css2?family=Mukta:wght@200;300;400;500;600;700;800&display=swap",
        },
        {
            font: "Libre Baskerville",
            url: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap",
        },
        {
            font: "Arimo",
            url: "https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400..700;1,400..700&display=swap",
        },
        {
            font: "Bebas Neue",
            url: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap",
        },
        {
            font: "Source Code Pro",
            url: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap",
        },
        {
            font: "Dosis",
            url: "https://fonts.googleapis.com/css2?family=Dosis:wght@200..800&display=swap",
        },
        {
            font: "PT Sans Narrow",
            url: "https://fonts.googleapis.com/css2?family=PT+Sans+Narrow:wght@400;700&display=swap",
        },
        {
            font: "Bitter",
            url: "https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Cabin",
            url: "https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&display=swap",
        },
        {
            font: "Anton",
            url: "https://fonts.googleapis.com/css2?family=Anton&display=swap",
        },
        {
            font: "Abel",
            url: "https://fonts.googleapis.com/css2?family=Abel&display=swap",
        },
        {
            font: "Oxygen",
            url: "https://fonts.googleapis.com/css2?family=Oxygen:wght@300;400;700&display=swap",
        },
        {
            font: "Dancing Script",
            url: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap",
        },
        {
            font: "Hind Siliguri",
            url: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap",
        },
        {
            font: "Barlow Condensed",
            url: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
        },
        {
            font: "Jost",
            url: "https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Sora",
            url: "https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap",
        },
        {
            font: "Archivo",
            url: "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "EB Garamond",
            url: "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap",
        },
        {
            font: "Hind",
            url: "https://fonts.googleapis.com/css2?family=Hind:wght@300;400;500;600;700&display=swap",
        },
        {
            font: "Exo 2",
            url: "https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Teko",
            url: "https://fonts.googleapis.com/css2?family=Teko:wght@300..700&display=swap",
        },
        {
            font: "DM Serif Display",
            url: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap",
        },
        {
            font: "Comfortaa",
            url: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap",
        },
        {
            font: "Outfit",
            url: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",
        },
        {
            font: "Pacifico",
            url: "https://fonts.googleapis.com/css2?family=Pacifico&display=swap",
        },
        {
            font: "Assistant",
            url: "https://fonts.googleapis.com/css2?family=Assistant:wght@200..800&display=swap",
        },
        {
            font: "Lobster",
            url: "https://fonts.googleapis.com/css2?family=Lobster&display=swap",
        },
        {
            font: "Crimson Text",
            url: "https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap",
        },
        {
            font: "Climate Crisis",
            url: "https://fonts.googleapis.com/css2?family=Climate+Crisis&display=swap",
        },
        {
            font: "Fjalla One",
            url: "https://fonts.googleapis.com/css2?family=Fjalla+One&display=swap",
        },
        {
            font: "Public Sans",
            url: "https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Signika Negative",
            url: "https://fonts.googleapis.com/css2?family=Signika+Negative:wght@300..700&display=swap",
        },
        {
            font: "Satisfy",
            url: "https://fonts.googleapis.com/css2?family=Satisfy&display=swap",
        },
        {
            font: "Prompt",
            url: "https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
        },
        {
            font: "IBM Plex Mono",
            url: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap",
        },
        {
            font: "Varela Round",
            url: "https://fonts.googleapis.com/css2?family=Varela+Round&display=swap",
        },
        {
            font: "Space Grotesk",
            url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap",
        },
        {
            font: "M PLUS Rounded 1c",
            url: "https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c&display=swap",
        },
        {
            font: "Caveat",
            url: "https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap",
        },
        {
            font: "Arvo",
            url: "https://fonts.googleapis.com/css2?family=Arvo:ital,wght@0,400;0,700;1,400;1,700&display=swap",
        },
        {
            font: "Overpass",
            url: "https://fonts.googleapis.com/css2?family=Overpass:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Maven Pro",
            url: "https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400..900&display=swap",
        },
        {
            font: "DM Serif Display",
            url: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap",
        },
        {
            font: "Slabo 27px",
            url: "https://fonts.googleapis.com/css2?family=Slabo+27px&display=swap",
        },
        {
            font: "Play",
            url: "https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap",
        },
        {
            font: "Rajdhani",
            url: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap",
        },
        {
            font: "Red Hat Display",
            url: "https://fonts.googleapis.com/css2?family=Red+Hat+Display:ital,wght@0,300..900;1,300..900&display=swap",
        },
        {
            font: "Cormorant Garamond",
            url: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap",
        },
        {
            font: "Asap",
            url: "https://fonts.googleapis.com/css2?family=Asap:ital,wght@0,100..900;1,100..900&display=swap",
        },
        {
            font: "Fira Sans Condensed",
            url: "https://fonts.googleapis.com/css2?family=Fira+Sans+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
        },
        {
            font: "Zilla Slab",
            url: "https://fonts.googleapis.com/css2?family=Zilla+Slab:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap",
        },
        {
            font: "Shadows Into Light",
            url: "https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap",
        },
        {
            font: "Chakra Petch",
            url: "https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap",
        },
        {
            font: "Lexend",
            url: "https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap",
        },
        {
            font: "Figtree",
            url: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap",
        },
        {
            font: "IBM Plex Serif",
            url: "https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap",
        },
        {
            font: "Barlow Semi Condensed",
            url: "https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
        },
        {
            font: "Archivo Black",
            url: "https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap",
        },
        {
            font: "Merriweather Sans",
            url: "https://fonts.googleapis.com/css2?family=Merriweather+Sans:ital,wght@0,300..800;1,300..800&display=swap",
        },
        {
            font: "Questrial",
            url: "https://fonts.googleapis.com/css2?family=Questrial&display=swap",
        },
        {
            font: "Signika",
            url: "https://fonts.googleapis.com/css2?family=Signika:wght@300..700&display=swap",
        },
    ];

    var fontLinks = [];

    customFonts.forEach(font => fontLinks.push(font.url));

    var editor = grapesjs.init({
        height: "100%",
        container: "#gjs",
        // fromElement: true,
        components: pageContent,
        showOffsets: true,
        canvas: {
            styles: fontLinks,
        },
        assetManager: {
            embedAsBase64: false,
            assets: images,
            multiUpload: false,
            upload: `${baseUrl}/pages/uploadFile`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("sessionToken")}`,
                pageId,
            },
            uploadName: "file",
            credentials: "omit",
        },
        selectorManager: { componentFirst: true },
        styleManager: {
            sectors: [
                {
                    name: "General",
                    open: false,
                    properties: [
                        {
                            extend: "float",
                            type: "radio",
                            default: "none",
                            options: [
                                { value: "none", className: "fa fa-times" },
                                {
                                    value: "left",
                                    className: "fa fa-align-left",
                                },
                                {
                                    value: "right",
                                    className: "fa fa-align-right",
                                },
                            ],
                        },
                        "display",
                        { extend: "position", type: "select" },
                        "top",
                        "right",
                        "left",
                        "bottom",
                    ],
                },
                {
                    name: "Dimension",
                    open: false,
                    properties: [
                        "width",
                        {
                            id: "flex-width",
                            type: "integer",
                            name: "Width",
                            units: ["px", "%"],
                            property: "flex-basis",
                            toRequire: 1,
                        },
                        "height",
                        "max-width",
                        "min-height",
                        "margin",
                        "padding",
                    ],
                },
                {
                    name: "Typography",
                    open: false,
                    properties: [
                        "font-family",
                        "font-size",
                        "font-weight",
                        "letter-spacing",
                        "color",
                        "line-height",
                        {
                            extend: "text-align",
                            default: "center",
                            options: [
                                {
                                    id: "left",
                                    label: "Left",
                                    className: "fa fa-align-left",
                                },
                                {
                                    id: "center",
                                    label: "Center",
                                    className: "fa fa-align-center",
                                    value: "center",
                                },
                                {
                                    id: "right",
                                    label: "Right",
                                    className: "fa fa-align-right",
                                },
                                {
                                    id: "justify",
                                    label: "Justify",
                                    className: "fa fa-align-justify",
                                },
                            ],
                        },
                        {
                            property: "text-decoration",
                            type: "radio",
                            default: "none",
                            options: [
                                {
                                    id: "none",
                                    label: "None",
                                    className: "fa fa-times",
                                },
                                {
                                    id: "underline",
                                    label: "underline",
                                    className: "fa fa-underline",
                                },
                                {
                                    id: "line-through",
                                    label: "Line-through",
                                    className: "fa fa-strikethrough",
                                },
                            ],
                        },
                        "text-shadow",
                    ],
                },
                {
                    name: "Decorations",
                    open: false,
                    properties: [
                        "opacity",
                        "border-radius",
                        "border",
                        "box-shadow",
                        "background", // { id: 'background-bg', property: 'background', type: 'bg' }
                    ],
                },
                {
                    name: "Extra",
                    open: false,
                    buildProps: ["transition", "perspective", "transform"],
                },
                {
                    name: "Flex",
                    open: false,
                    properties: [
                        {
                            name: "Flex Container",
                            property: "display",
                            type: "select",
                            defaults: "block",
                            list: [
                                { value: "block", name: "Disable" },
                                { value: "flex", name: "Enable" },
                            ],
                        },
                        {
                            name: "Flex Parent",
                            property: "label-parent-flex",
                            type: "integer",
                        },
                        {
                            name: "Direction",
                            property: "flex-direction",
                            type: "radio",
                            defaults: "row",
                            list: [
                                {
                                    value: "row",
                                    name: "Row",
                                    className: "icons-flex icon-dir-row",
                                    title: "Row",
                                },
                                {
                                    value: "row-reverse",
                                    name: "Row reverse",
                                    className: "icons-flex icon-dir-row-rev",
                                    title: "Row reverse",
                                },
                                {
                                    value: "column",
                                    name: "Column",
                                    title: "Column",
                                    className: "icons-flex icon-dir-col",
                                },
                                {
                                    value: "column-reverse",
                                    name: "Column reverse",
                                    title: "Column reverse",
                                    className: "icons-flex icon-dir-col-rev",
                                },
                            ],
                        },
                        {
                            name: "Justify",
                            property: "justify-content",
                            type: "radio",
                            defaults: "center",
                            list: [
                                {
                                    value: "flex-start",
                                    className: "icons-flex icon-just-start",
                                    title: "Start",
                                },
                                {
                                    value: "flex-end",
                                    title: "End",
                                    className: "icons-flex icon-just-end",
                                },
                                {
                                    value: "space-between",
                                    title: "Space between",
                                    className: "icons-flex icon-just-sp-bet",
                                },
                                {
                                    value: "space-around",
                                    title: "Space around",
                                    className: "icons-flex icon-just-sp-ar",
                                },
                                {
                                    value: "center",
                                    title: "Center",
                                    className: "icons-flex icon-just-sp-cent",
                                },
                            ],
                        },
                        {
                            name: "Align",
                            property: "align-items",
                            type: "radio",
                            defaults: "center",
                            list: [
                                {
                                    value: "flex-start",
                                    title: "Start",
                                    className: "icons-flex icon-al-start",
                                },
                                {
                                    value: "flex-end",
                                    title: "End",
                                    className: "icons-flex icon-al-end",
                                },
                                {
                                    value: "stretch",
                                    title: "Stretch",
                                    className: "icons-flex icon-al-str",
                                },
                                {
                                    value: "center",
                                    title: "Center",
                                    className: "icons-flex icon-al-center",
                                },
                            ],
                        },
                        {
                            name: "Flex Children",
                            property: "label-parent-flex",
                            type: "integer",
                        },
                        {
                            name: "Order",
                            property: "order",
                            type: "integer",
                            defaults: 0,
                            min: 0,
                        },
                        {
                            name: "Flex",
                            property: "flex",
                            type: "composite",
                            properties: [
                                {
                                    name: "Grow",
                                    property: "flex-grow",
                                    type: "integer",
                                    defaults: 0,
                                    min: 0,
                                },
                                {
                                    name: "Shrink",
                                    property: "flex-shrink",
                                    type: "integer",
                                    defaults: 0,
                                    min: 0,
                                },
                                {
                                    name: "Basis",
                                    property: "flex-basis",
                                    type: "integer",
                                    units: ["px", "%", ""],
                                    unit: "",
                                    defaults: "auto",
                                },
                            ],
                        },
                        {
                            name: "Align",
                            property: "align-self",
                            type: "radio",
                            defaults: "center",
                            list: [
                                {
                                    value: "auto",
                                    name: "Auto",
                                },
                                {
                                    value: "flex-start",
                                    title: "Start",
                                    className: "icons-flex icon-al-start",
                                },
                                {
                                    value: "flex-end",
                                    title: "End",
                                    className: "icons-flex icon-al-end",
                                },
                                {
                                    value: "stretch",
                                    title: "Stretch",
                                    className: "icons-flex icon-al-str",
                                },
                                {
                                    value: "center",
                                    title: "Center",
                                    className: "icons-flex icon-al-center",
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "Font",
                    properties: [
                        {
                            id: "fontSize",
                            type: "slider",
                            name: "Font size",
                            units: ["px"],
                            property: "font-size",
                            default: "12",
                            max: 100,
                        },
                        "font-family",
                        "color",
                        "background",
                        {
                            extend: "text-align",
                            default: "center",
                            options: [
                                {
                                    id: "left",
                                    label: "Left",
                                    className: "fa fa-align-left",
                                },
                                {
                                    id: "center",
                                    label: "Center",
                                    className: "fa fa-align-center",
                                    value: "center",
                                },
                                {
                                    id: "right",
                                    label: "Right",
                                    className: "fa fa-align-right",
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "Padding",
                    properties: [
                        {
                            id: "paddingTop",
                            type: "slider",
                            name: "Padding Top",
                            units: ["px"],
                            property: "padding-top",
                            default: "0",
                            max: 500,
                        },
                        {
                            id: "paddingBottom",
                            type: "slider",
                            name: "Padding Bottom",
                            units: ["px"],
                            property: "padding-bottom",
                            default: "0",
                            max: 500,
                        },
                        {
                            id: "paddingLeft",
                            type: "slider",
                            name: "Padding Left",
                            units: ["px"],
                            property: "padding-left",
                            default: "0",
                            max: 500,
                        },
                        {
                            id: "paddingRight",
                            type: "slider",
                            name: "Padding Right",
                            units: ["px"],
                            property: "padding-right",
                            default: "0",
                            max: 500,
                        },
                    ],
                },
                {
                    name: "Margin",
                    properties: [
                        {
                            id: "marginTop",
                            type: "slider",
                            name: "Margin Top",
                            units: ["px"],
                            property: "margin-top",
                            default: "0",
                            max: 500,
                        },
                        {
                            id: "marginBottom",
                            type: "slider",
                            name: "Margin Bottom",
                            units: ["px"],
                            property: "margin-bottom",
                            default: "0",
                            max: 500,
                        },
                        {
                            id: "marginLeft",
                            type: "slider",
                            name: "Margin Left",
                            units: ["px"],
                            property: "margin-left",
                            default: "0",
                            max: 500,
                        },
                        {
                            id: "marginRight",
                            type: "slider",
                            name: "Margin Right",
                            units: ["px"],
                            property: "margin-right",
                            default: "0",
                            max: 500,
                        },
                    ],
                },
            ],
        },
        plugins: [
            "gjs-blocks-basic",
            "grapesjs-plugin-forms",
            "grapesjs-component-countdown",
            "grapesjs-plugin-export",
            "grapesjs-tabs",
            "grapesjs-custom-code",
            "grapesjs-touch",
            "grapesjs-parser-postcss",
            "grapesjs-tooltip",
            "grapesjs-tui-image-editor",
            "grapesjs-typed",
            "grapesjs-style-bg",
            "grapesjs-preset-webpage",
            customComponentTypes,
        ],
        pluginsOpts: {
            "gjs-blocks-basic": {
                flexGrid: true,
                blocks: [
                    "column1",
                    "column2",
                    "column3",
                    "column3-7",
                    "link",
                    "video",
                    "map",
                ],
                category: "Elements",
            },
            "grapesjs-plugin-forms": {
                blocks: [
                    "form",
                    "input",
                    "textarea",
                    "select",
                    "label",
                    "checkbox",
                    "radio",
                ],
            },
            "grapesjs-tui-image-editor": {
                script: [
                    // 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.6.7/fabric.min.js',
                    "https://uicdn.toast.com/tui.code-snippet/v1.5.2/tui-code-snippet.min.js",
                    "https://uicdn.toast.com/tui-color-picker/v2.2.7/tui-color-picker.min.js",
                    "https://uicdn.toast.com/tui-image-editor/v3.15.2/tui-image-editor.min.js",
                ],
                style: [
                    "https://uicdn.toast.com/tui-color-picker/v2.2.7/tui-color-picker.min.css",
                    "https://uicdn.toast.com/tui-image-editor/v3.15.2/tui-image-editor.min.css",
                ],
            },
            "grapesjs-tabs": {
                tabsBlock: { category: "Extra" },
            },
            "grapesjs-typed": {
                block: {
                    category: "Extra",
                    content: {
                        type: "typed",
                        "type-speed": 40,
                        strings: [
                            "Text row one",
                            "Text row two",
                            "Text row three",
                        ],
                    },
                },
            },
            "grapesjs-preset-webpage": {
                modalImportTitle: "Import Template",
                modalImportLabel:
                    '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
                modalImportContent: function (editor) {
                    return (
                        editor.getHtml() +
                        "<style>" +
                        editor.getCss() +
                        "</style>"
                    );
                },
            },
        },
    });

    pageType === "website" &&
        editor.BlockManager.add(
            "hamburger-menu",
            {
                label: "Hamburger",
                content: { type: "hamburger-menu" },
                media: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" stroke="currentColor">
      <rect y="12" width="48" height="4" rx="2" fill="none"/>
      <rect y="24" width="48" height="4" rx="2" fill="none"/>
      <rect y="36" width="48" height="4" rx="2" fill="none"/>
    </svg>
    `,
                category: { id: "menu", label: "Menu" },
            },
            { at: 0 }
        );

    editor.BlockManager.add(
        "stepper-block",
        {
            label: "2 Step Order",
            content: { type: "products-stepper" },
            media: `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 0 48 48" width="48">
      <path d="M40 8H8c-2.21 0-3.98 1.79-3.98 4L4 36c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zm0 8L24 26 8 16v-4l16 10 16-10v4z"/>
      <path d="M0 0h48v48H0z" fill="none"/>
    </svg>`,
            category: { id: "forms", label: "Forms" },
        },
        { at: 1 }
    );

    editor.BlockManager.add(
        "email-block",
        {
            label: "Email",
            content: { type: "email-form" },
            media: `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 0 48 48" width="48">
      <path d="M40 8H8c-2.21 0-3.98 1.79-3.98 4L4 36c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zm0 8L24 26 8 16v-4l16 10 16-10v4z"/>
      <path d="M0 0h48v48H0z" fill="none"/>
    </svg>`,
            category: { id: "forms", label: "Forms" },
        },
        { at: 1 }
    );

    editor.BlockManager.add(
        "button-link",
        {
            label: "Button",
            content: { type: "button-link", activeOnRender: 1 },
            media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M22 9c0-.6-.5-1-1.3-1H3.4C2.5 8 2 8.4 2 9v6c0 .6.5 1 1.3 1h17.4c.8 0 1.3-.4 1.3-1V9zm-1 6H3V9h18v6z"></path>
      <path d="M4 11.5h16v1H4z"></path>
    </svg>`,
            category: { id: "forms", label: "Forms" },
        },
        { at: 4 }
    );

    editor.BlockManager.add(
        "full-width-section",
        {
            label: "Full Width",
            content: { type: "full-width-section" },
            media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" width="100" height="50">
    <rect width="100%" height="100%" rx="10" ry="10" fill="none" stroke="#ccc" stroke-width="6"/>
  </svg>`,
            category: { id: "Sections", label: "Sections" },
        },
        { at: 0 }
    );

    editor.BlockManager.add(
        "wide-width-section",
        {
            label: "Wide",
            content: { type: "wide-width-section" },
            media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" width="100" height="50">
    <rect width="100%" height="100%" rx="10" ry="10" fill="none" stroke="#ccc" stroke-width="6"/>
  </svg>`,
            category: { id: "Sections", label: "Sections" },
        },
        { at: 1 }
    );

    editor.BlockManager.add(
        "medium-width-section",
        {
            label: "Medium",
            content: { type: "medium-width-section" },
            media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" width="50" height="50">
    <rect width="100%" height="100%" rx="10" ry="10" fill="none" stroke="#ccc" stroke-width="6"/>
  </svg>`,
            category: { id: "Sections", label: "Sections" },
        },
        { at: 2 }
    );

    editor.BlockManager.add(
        "small-width-section",
        {
            label: "Small",
            content: { type: "small-width-section" },
            media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" width="100" height="50">
    <rect width="100%" height="100%" rx="10" ry="10" fill="none" stroke="#ccc" stroke-width="6"/>
  </svg>`,
            category: { id: "Sections", label: "Sections" },
        },
        { at: 3 }
    );

    editor.BlockManager.add(
        "text-headline-block",
        {
            label: "Headline",
            content: { type: "text-headline" },
            media: `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path fill="#bbbcc3" d="M0 64C0 46.3 14.3 32 32 32H80h48c17.7 0 32 14.3 32 32s-14.3 32-32 32H112V208H336V96H320c-17.7 0-32-14.3-32-32s14.3-32 32-32h48 48c17.7 0 32 14.3 32 32s-14.3 32-32 32H400V240 416h16c17.7 0 32 14.3 32 32s-14.3 32-32 32H368 320c-17.7 0-32-14.3-32-32s14.3-32 32-32h16V272H112V416h16c17.7 0 32 14.3 32 32s-14.3 32-32 32H80 32c-17.7 0-32-14.3-32-32s14.3-32 32-32H48V240 96H32C14.3 96 0 81.7 0 64z"/></svg>`,
            category: { id: "Elements", label: "Rows & Elements" },
        },
        { at: 9 }
    );

    editor.BlockManager.add(
        "text-subtitle-block",
        {
            label: "Subtitle",
            content: { type: "text-subtitle" },
            media: `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path fill="#bbbcc3" d="M254 52.8C249.3 40.3 237.3 32 224 32s-25.3 8.3-30 20.8L57.8 416H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32h-1.8l18-48H303.8l18 48H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H390.2L254 52.8zM279.8 304H168.2L224 155.1 279.8 304z"/></svg>`,
            category: { id: "Elements", label: "Rows & Elements" },
        },
        { at: 10 }
    );

    editor.BlockManager.add(
        "text-paragraph-block",
        {
            label: "Paragraph",
            content: { type: "text-paragraph" },
            media: `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path fill="#bbbcc3" d="M192 32h64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H384l0 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-352H288V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V352H192c-88.4 0-160-71.6-160-160s71.6-160 160-160z"/></svg>`,
            category: { id: "Elements", label: "Rows & Elements" },
        },
        { at: 11 }
    );

    editor.BlockManager.add(
        "image-link",
        {
            label: "Image",
            content: { type: "image-link", activeOnRender: 1 },
            media: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M21,3H3C2,3 1,4 1,5V19A2,2 0 0,0 3,21H21C22,21 23,20 23,19V5C23,4 22,3 21,3M5,17L8.5,12.5L11,15.5L14.5,11L19,17H5Z"></path>
  </svg>`,
            category: { id: "Elements", label: "Rows & Elements" },
        },
        { at: 12 }
    );

    editor.I18n.addMessages({
        en: {
            styleManager: {
                properties: {
                    "background-repeat": "Repeat",
                    "background-position": "Position",
                    "background-attachment": "Attachment",
                    "background-size": "Size",
                },
            },
        },
    });

    editor.on("asset:upload:response", ({ src }) => {
        const am = editor.AssetManager;
        const { models } = am.getAll();
        const filteredImages = models.filter(
            ({ attributes }) =>
                !attributes.src.includes("data:image/png;base64,")
        );
        const updatedAssets = [{ src }, ...filteredImages];
        am.add({ src });
        am.render(updatedAssets);
    });

    var pn = editor.Panels;
    var modal = editor.Modal;
    var cmdm = editor.Commands;

    // Add info command
    var mdlClass = "gjs-mdl-dialog-sm";
    var infoContainer = document.getElementById("info-panel");

    cmdm.add("open-info", function () {
        var mdlDialog = document.querySelector(".gjs-mdl-dialog");
        mdlDialog.className += " " + mdlClass;
        infoContainer.style.display = "block";
        modal.setTitle("About this demo");
        modal.setContent(infoContainer);
        modal.open();
        modal.getModel().once("change:open", function () {
            mdlDialog.className = mdlDialog.className.replace(mdlClass, "");
        });
    });

    pn.addButton("options", {
        id: "saveChanges",
        className: "fa fa-floppy-o code-icons-part ml-2 toolbar-button-font",
        label: "Save Changes",
        command: function () {
            document.getElementById("saving-overlay").style.display = "block";
            localStorage.removeItem("gjsProject");
            var fontSet = new Set();

            editor.getProjectData().styles.forEach(({ style }) => {
                if (style["font-family"]) {
                    fontSet.add(style["font-family"]);
                }
            });
            var linksText = ``;
            Array.from(fontSet).forEach(font => {
                var existingFont = customFonts.find(customFont =>
                    font.includes(customFont.font)
                );
                if (existingFont)
                    linksText += `
            <link rel="preload" as="style" href="${existingFont.url}" onload="this.onload=null;this.rel='stylesheet'">
            <noscript><link rel="stylesheet" type="text/css" href="${existingFont.url}"></noscript>
          `;
            });
            var jsonContent = editor.getProjectData();
            var jsContent = editor.getJs();
            var htmlContent = editor
                .getHtml()
                .replace(
                    "</body>",
                    "<script>" + jsContent + "</script></body>"
                );
            var cssContent = editor.getCss();
            cssContent = cssContent.replace(
                '.gjs-cell:empty:after{content:"+";font-weight:bold;font-size:36px;color:white;align-items:center;justify-content:center;display:flex;background-color:#45433f;border-radius:2rem;height:100%;width:100%;}',
                ""
            );
            // Prepare the data to be sent
            var dataToSend = {
                json: jsonContent,
                html:
                    `<html><head>${linksText}<style>` +
                    cssContent +
                    "</style></head>" +
                    htmlContent +
                    "</html>",
                extraHead:
                    localStorage.getItem(pageId + "_extraHead") || undefined,
                extraBody:
                    localStorage.getItem(pageId + "_extraBody") || undefined,
            };

            // Send the data to the server
            const sessionToken = localStorage.getItem("sessionToken");
            fetch(`${baseUrl}/pages/${pageId}/save`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionToken}`,
                },
                body: JSON.stringify(dataToSend),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to save");
                    }
                    return response.text();
                })
                .then(data => {})
                .catch(error => {
                    console.error("Error:", error);
                    setTimeout(function () {
                        alert("Failed to save the page.");
                    }, 500);
                })
                .finally(() => {
                    document.getElementById("saving-overlay").style.display =
                        "none";
                });
        },
        attributes: { title: "Save Changes" },
        active: false,
    });

    pn.addButton("commands", [
        {
            id: "exit",
            label: `
        <span class="toolbar-button-font">&larr; Back</span>
      `,
            attributes: {
                style: "align-items: center; gap: 2px; padding: 1px 7px;",
            },
            command: function () {
                const status = localStorage.getItem("gjsProject");
                if (status) {
                    const closeConfirm = confirm(
                        "Are you sure you want to leave without saving?"
                    );
                    if (!closeConfirm) return;
                }
                window.location.href = `/projects/${projectId}/${pageType && pageType === "website" ? "websites" : "funnels"}/${funnelId}?page=${pageId}`;
            },
        },
        {
            id: "logo",
            label: `<img class="gjs-logo" src="/assets/images/logo.svg" />`,
            attributes: {
                style: "position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);",
            },
        },
    ]);

    pn.addButton("options", {
        id: "codeButton",
        className: "fa fa-code code-icons-part toolbar-button-font",
        label: "Code",
        command: function () {
            const modal = editor.Modal;
            showHeadView();
            function showHeadView() {
                modal.setContent(`
          <div id="modalTabs" class="modal-tabs">
            <div id="headView" class="views">
              <label for="headTextarea">Head:</label>
              <textarea id="headTextarea" placeholder="Add Your HTML/JavaScript Here..." class="modal-textarea"></textarea>
            </div>
            <div id="bodyView" class="views">
              <label for="bodyTextarea">Body:</label>
              <textarea id="bodyTextarea" placeholder="Add Your HTML/JavaScript Here..." class="modal-textarea"></textarea>
            </div>
          </div>
          <div class="modal-button-container">
            <button id="modalButton" class="modal-button">Save Changes</button>
          </div>
      `);
                setupButtonClickListener();
            }
            document.getElementById("headTextarea").textContent =
                localStorage.getItem(pageId + "_extraHead") || "";
            document.getElementById("bodyTextarea").textContent =
                localStorage.getItem(pageId + "_extraBody") || "";

            function setupButtonClickListener() {
                const modalButton = document.getElementById("modalButton");
                modalButton.addEventListener("click", function () {
                    const headTextarea =
                        document.getElementById("headTextarea");
                    const bodyTextarea =
                        document.getElementById("bodyTextarea");

                    localStorage.setItem(
                        pageId + "_extraHead",
                        headTextarea.value
                    );
                    localStorage.setItem(
                        pageId + "_extraBody",
                        bodyTextarea.value
                    );
                    localStorage.setItem("gjsProject", "updated");

                    modal.close();
                });
            }

            modal.open();
        },
    });

    // Simple warn notifier
    var origWarn = console.error;
    toastr.options = {
        closeButton: true,
        preventDuplicates: true,
        showDuration: 250,
        hideDuration: 150,
    };
    console.error = function (msg) {
        if (msg.indexOf("[undefined]") == -1) {
            toastr.warning(msg);
        }
        origWarn(msg);
    };

    // Add and beautify tooltips
    [
        ["sw-visibility", "Show Borders"],
        ["preview", "Preview"],
        ["fullscreen", "Fullscreen"],
        ["export-template", "Export"],
        ["undo", "Undo"],
        ["redo", "Redo"],
        ["gjs-open-import-webpage", "Import"],
        ["canvas-clear", "Clear canvas"],
        ["saveChanges", "Save changes"],
        ["codeButton", "Code"],
    ].forEach(function (item) {
        pn.getButton("options", item[0]).set("attributes", {
            title: item[1],
            "data-tooltip-pos": "bottom",
        });
    });
    [
        ["open-sm", "Styles", styleManager],
        ["open-layers", "Layers", layers],
        ["open-blocks", "Elements", blocks],
    ].forEach(function (item) {
        const [key, title, icon] = item;
        pn.getButton("views", key)
            .set("attributes", { title, "data-tooltip-pos": "bottom" })
            .set(
                "label",
                `<span class='single-panel toolbar-button-font'>${icon}<span>${title}</span></span>`
            );
    });
    var titles = document.querySelectorAll("*[title]");

    for (var i = 0; i < titles.length; i++) {
        var el = titles[i];
        var title = el.getAttribute("title");
        title = title ? title.trim() : "";
        if (!title) break;
        el.setAttribute("data-tooltip", title);
        el.setAttribute("title", "");
    }

    // Store and load events
    editor.on("storage:load", function (e) {});
    editor.on("storage:store", function (e) {});
    editor.on("component:selected", component => {
        if (component.attributes.name === "Section") {
            editor.Panels.getButton("views", "open-sm").set("active", false);
            editor.Panels.getButton("views", "open-layers").set(
                "active",
                false
            );
            editor.Panels.getButton("views", "open-blocks").set("active", true);
        }
        if (component.attributes.name === "Cell") {
            editor.Panels.getButton("views", "open-sm").set("active", false);
            editor.Panels.getButton("views", "open-layers").set(
                "active",
                false
            );
            editor.Panels.getButton("views", "open-blocks").set("active", true);
        }
        if (
            component.attributes.type === "button-link" ||
            component.attributes.type === "image-link"
        ) {
            delete advancedStyles.settingsStyle;
            easyStyles = { ...easyStyles, settingsStyle };

            showGeneralTab(editor);
            toggleTraitSector(true);
        } else {
            delete easyStyles.settingsStyle;
            advancedStyles = { ...advancedStyles, settingsStyle };
        }
    });
    editor.on("component:add", async component => {
        if (component.get("type") === "text") {
            component.setStyle({
                "margin-top": "10px",
                "margin-bottom": "10px",
                "padding-left": "calc((100% - 1200px) / 2)",
                "padding-right": "calc((100% - 1200px) / 2)",
                "text-align": "center",
                "font-size": "24px",
            });
        }
    });
    editor.on("style:target", component => {
        var parentElem = $(".gjs-sm-sectors.gjs-one-bg.gjs-two-color");
        parentElem.hide();

        if (selectedStyleTab === styleTabs.general) {
            Object.values(easyStyles).forEach(style => {
                style.display = "block";
            });
            Object.values(advancedStyles).forEach(style => {
                setTimeout(() => {
                    style.display = "none";
                    parentElem.show();
                }, 5);
            });
        } else {
            Object.values(advancedStyles).forEach(style => {
                style.display = "block";
            });
            Object.values(easyStyles).forEach(style => {
                setTimeout(() => {
                    style.display = "none";
                    parentElem.show();
                }, 5);
            });
        }
    });

    function parsePadding(paddingString) {
        const paddingValues = paddingString.trim().split(" ");
        const [top, right, bottom, left] = paddingValues;
        return {
            paddingTop: top,
            paddingRight: right,
            paddingBottom: bottom,
            paddingLeft: left,
        };
    }
    editor.on("style:property:update", propInfo => {
        if (
            propInfo.property.id === "padding-top-sub" ||
            propInfo.property.id === "padding-bottom-sub" ||
            propInfo.property.id === "padding-left-sub" ||
            propInfo.property.id === "padding-right-sub"
        ) {
            const oldStyle = editor.getSelected().getStyle();

            if (
                !(
                    oldStyle["padding-top"] ||
                    oldStyle["padding-bottom"] ||
                    oldStyle["padding-left"] ||
                    oldStyle["padding-right"]
                ) &&
                oldStyle.padding
            ) {
                const padding = oldStyle.padding
                    ? oldStyle.padding
                    : "0px 0px 0px 0px";
                const parsedPadding = parsePadding(padding);

                paddingTop = parsedPadding.paddingTop;
                paddingBottom = parsedPadding.paddingBottom;
                paddingLeft = parsedPadding.paddingLeft;
                paddingRight = parsedPadding.paddingRight;
            } else {
                paddingTop = oldStyle["padding-top"] ?? "0px";
                paddingBottom = oldStyle["padding-bottom"] ?? "0px";
                paddingLeft = oldStyle["padding-left"] ?? "0px";
                paddingRight = oldStyle["padding-right"] ?? "0px";
            }
            paddingTop =
                propInfo.property.attributes.property === "padding-top"
                    ? propInfo.value
                    : paddingTop;
            paddingBottom =
                propInfo.property.attributes.property === "padding-bottom"
                    ? propInfo.value
                    : paddingBottom;
            paddingLeft =
                propInfo.property.attributes.property === "padding-left"
                    ? propInfo.value
                    : paddingLeft;
            paddingRight =
                propInfo.property.attributes.property === "padding-right"
                    ? propInfo.value
                    : paddingRight;
        }
    });

    addFonts = () => {
        let styleManager = editor.StyleManager;
        let fontProperty = styleManager.getProperty(
            "typography",
            "font-family"
        );
        let options = fontProperty.get("options");
        customFonts.forEach(font =>
            options.push({
                value: `${font.font + ", sans-serif"}`,
                label: font.font,
            })
        );
        options.sort((optionA, optionB) => {
            if (optionA.label < optionB.label) {
                return -1;
            }
            if (optionA.label > optionB.label) {
                return 1;
            }
            return 0;
        });
        fontProperty.set("options", options);
        let styleElement = document.createElement("style");
        options?.forEach(
            option =>
                (styleElement.textContent += `
      .gjs-select option[value="${option.id || option.value}"] {
        font-family: "${option.label}";
      }
    `)
        );
        document.head.appendChild(styleElement);
        styleManager.render();
    };

    const getStyles = components => {
        // Saving every component styling in the tree recursively
        components.forEach(component => {
            const recurse = comp => {
                // If component has styling then save it to a temp attribute
                if (Object.keys(comp.getStyle()).length !== 0)
                    comp.attributes.savedStyle = comp.getStyle();
                if (comp.get("components").length) {
                    comp.get("components").forEach(child => {
                        recurse(child);
                    });
                }
            };
            recurse(component);
        });
        return components;
    };

    const setStyles = component => {
        // Styling every component in the tree recursively
        const recurse = comp => {
            // Base case: apply saved style to component
            if ("savedStyle" in comp.attributes) {
                comp.setStyle(comp.attributes.savedStyle);
                delete comp.attributes.savedStyle;
            }
            if (comp.attributes.components.length) {
                comp.attributes.components.forEach(child => {
                    recurse(child);
                });
            }
        };
        recurse(component);
    };

    const newCopy = selected => {
        window.localStorage.setItem(
            "grapesjs_clipboard",
            JSON.stringify(selected)
        );
    };

    const newPaste = selected => {
        let components = JSON.parse(
            window.localStorage.getItem("grapesjs_clipboard")
        );
        if (components) {
            if (selected && selected.attributes.type !== "wrapper") {
                const index = selected.index();
                // Invert order so the last item is first added then pushed down as others get added.
                components.reverse();
                const currentSelection = selected.collection;
                components.forEach(comp => {
                    if (currentSelection) {
                        const added = currentSelection.add(comp, {
                            at: index + 1,
                        });
                        editor.trigger("component:paste", added);
                        setStyles(added);
                    }
                });
                selected.emitUpdate();
            } else {
                components = editor.addComponents(components);
                components.forEach(comp => {
                    setStyles(comp);
                });
            }
        }
    };
    // Do stuff on load
    editor.on("load", async function () {
        var $ = grapesjs.$;
        addFonts();
        // Don't show borders by default
        pn.getButton("options", "sw-visibility").set("active", 0);

        editor.Commands.add("core:copy", {
            run(editor) {
                const selected = getStyles([...editor.getSelectedAll()]);
                let filteredSelected = selected.filter(
                    item => item.attributes.copyable == true
                );
                if (filteredSelected.length) {
                    newCopy(filteredSelected);
                }
            },
        });

        editor.Commands.add("core:paste", {
            run(editor, s, opts = {}) {
                const selected = editor.getSelected();
                newPaste(selected);
            },
        });
        var openTmBtn = pn.getButton("views", "open-tm");
        openTmBtn && openTmBtn.set("active", 1);
        var openSm = pn.getButton("views", "open-sm");
        openSm && openSm.set("active", 1);

        // Remove trait view
        pn.removeButton("views", "open-tm");

        // Add Settings Sector
        var traitsSector = $(
            '<div class="gjs-sm-sector no-select settings">' +
                '<div class="gjs-sm-sector-title"><div id="triangle" class="gjs-sm-sector-caret"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M7,10L12,15L17,10H7Z"></path></svg></div>' +
                '<span class="gjs-sm-sector-label">Settings</span> </div>' +
                '<div class="gjs-sm-properties" style="display: none;"></div></div>'
        );
        traitsProps = traitsSector.find(".gjs-sm-properties");
        traitsProps.append($(".gjs-trt-traits"));
        $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color > div.gjs-sm-sector.gjs-sm-sector__general.no-select"
        ).before(traitsSector);

        traitStyle = traitsProps.get(0).style;

        traitsSector
            .find(".gjs-sm-sector-title")
            .on("click", () => toggleTraitSector());

        // Prevent style change due to scrollbar dynamic appearance.
        $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container"
        ).css("scrollbar-gutter", "stable");

        // Moving classes container
        classContainer = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
        ).get(0);

        // Styling selectors
        generalStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color > div.gjs-sm-sector.gjs-sm-sector__general.no-select"
        ).get(0).style;
        dimensionStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color > div.gjs-sm-sector.gjs-sm-sector__dimension.no-select"
        ).get(0).style;
        typographyStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color > div.gjs-sm-sector.gjs-sm-sector__typography.no-select"
        ).get(0).style;
        decorationsStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color > div.gjs-sm-sector.gjs-sm-sector__decorations.no-select"
        ).get(0).style;
        extraStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color > div.gjs-sm-sector.gjs-sm-sector__extra.no-select"
        ).get(0).style;
        flexStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color > div.gjs-sm-sector.gjs-sm-sector__flex.no-select"
        ).get(0).style;
        settingsStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color > div:nth-child(1)"
        ).get(0).style;
        classesContainerStyle = classContainer.style;

        easyPaddingStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color > div.gjs-sm-sector.gjs-sm-sector__padding.no-select"
        ).get(0).style;
        easyMarginStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color > div.gjs-sm-sector.gjs-sm-sector__margin.no-select"
        ).get(0).style;
        easyFontStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color > div.gjs-sm-sector.gjs-sm-sector__font.no-select"
        ).get(0).style;

        advancedStyles = {
            generalStyle,
            dimensionStyle,
            typographyStyle,
            decorationsStyle,
            extraStyle,
            flexStyle,
            settingsStyle,
            classesContainerStyle,
        };
        easyStyles = { easyPaddingStyle, easyMarginStyle, easyFontStyle };

        // Default
        Object.values(advancedStyles).forEach(
            style => (style.display = "none")
        );
        Object.values(easyStyles).forEach(style => (style.display = "block"));

        // Advanced Styling
        var advancedSector = $(
            '<div class="gjs-sm-sector no-select advanced">' +
                '<div class="gjs-sm-sector-title" style="color: white"><span class="icon-settings fa fa-wrench"></span> <span class="gjs-sm-sector-label" style="color:white;">Advanced</span></div>' +
                '<div class="gjs-sm-properties" style="display: none;"></div></div>'
        );
        $(".gjs-sm-sectors").before(advancedSector);
        var gjsSectors = $(".gjs-sm-sectors").get(0);
        $(".gjs-sm-sector.advanced").css("opacity", "0.5");
        advancedSector
            .find(".gjs-sm-sector-title")
            .on("click", showAdvancedTab);

        // Easy styling
        var easySector = $(
            '<div class="gjs-sm-sector no-select general">' +
                '<div class="gjs-sm-sector-title" style="color: white"><span class="icon-settings fa fa-star"></span> <span class="gjs-sm-sector-label" style="color:white;">General</span></div>' +
                '<div class="gjs-sm-properties" style="display: none;"></div></div>'
        );
        $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)"
        ).before(easySector);
        easySector
            .find(".gjs-sm-sector-title")
            .on("click", () => showGeneralTab(editor));

        var styleManagerContainerStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2)"
        ).get(0).style;
        styleManagerContainerStyle["display"] = "grid";
        styleManagerContainerStyle["grid-template-columns"] = "repeat(2, 1fr)";

        var styleOptionsContainerStyle = $(
            "#gjs > div.gjs-editor.gjs-one-bg.gjs-two-color > div.gjs-pn-panels > div.gjs-pn-panel.gjs-pn-views-container.gjs-one-bg.gjs-two-color > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div.gjs-sm-sectors.gjs-one-bg.gjs-two-color"
        ).get(0).style;
        styleOptionsContainerStyle["grid-column"] = "span 2";

        // Move class container into General Styling
        gjsSectors.prepend(classContainer);

        // Open block manager
        var openBlocksBtn = editor.Panels.getButton("views", "open-blocks");
        openBlocksBtn && openBlocksBtn.set("active", 1);

        localStorage.removeItem("gjsProject");

        loadSavedSections(editor, sessionToken);
    });
}

function modifyEditor() {
    document.querySelector('span[data-tooltip="Preview"]').hidden = true;
    document.querySelector('span[data-tooltip="Import"]').hidden = true;
    document.querySelector('span[data-tooltip="Clear canvas"]').hidden = true;
    document.querySelector('span[data-tooltip="View code"]').hidden = true;
    document.querySelector('span[data-tooltip="View components"]').hidden =
        true;
    document.querySelector('span[data-tooltip="Fullscreen"]').hidden = true;

    // put the 'edit code' button next to 'save' button
    function moveLastSpanToStart() {
        var div = document.querySelectorAll(".gjs-pn-buttons")[2];
        if (div) {
            var spans = div.querySelectorAll("span");
            if (spans.length > 1) {
                var lastSpan = spans[spans.length - 1];
                div.removeChild(lastSpan);
                div.insertBefore(lastSpan, spans[6]);
            }
        }
    }
    moveLastSpanToStart();
}

function loadSavedSections(editor, sessionToken) {
    fetch(`${baseUrl}/sections`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
        },
    })
        .then(res => res.json())
        .then(data => {
            // Step 1: Get the Json for all sections in parallel
            Promise.all(
                data.sections.map(section =>
                    fetch(section.jsonUrl).then(response =>
                        response.json().then(json => ({
                            title: section.title,
                            _id: section._id,
                            json: json,
                        }))
                    )
                )
            ).then(results => {
                // Step 2: Sort the sections based on the title
                const sortedSections = results.sort((a, b) =>
                    a.title.localeCompare(b.title)
                );

                // Step 3: Add all sections to the BlockManager
                sortedSections.forEach(section => {
                    editor.BlockManager.remove("savedSection_" + section._id);
                    editor.BlockManager.add("savedSection_" + section._id, {
                        label: section.title,
                        media: `
          <svg style="padding-top: 10px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" width="800px" height="75px" viewBox="0 0 32 32" version="1.1">
            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
              <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-152.000000, -515.000000)" fill="currentColor">
                <path d="M171,525 C171.552,525 172,524.553 172,524 L172,520 C172,519.447 171.552,519 171,519 C170.448,519 170,519.447 170,520 L170,524 C170,524.553 170.448,525 171,525 L171,525 Z M182,543 C182,544.104 181.104,545 180,545 L156,545 C154.896,545 154,544.104 154,543 L154,519 C154,517.896 154.896,517 156,517 L158,517 L158,527 C158,528.104 158.896,529 160,529 L176,529 C177.104,529 178,528.104 178,527 L178,517 L180,517 C181.104,517 182,517.896 182,519 L182,543 L182,543 Z M160,517 L176,517 L176,526 C176,526.553 175.552,527 175,527 L161,527 C160.448,527 160,526.553 160,526 L160,517 L160,517 Z M180,515 L156,515 C153.791,515 152,516.791 152,519 L152,543 C152,545.209 153.791,547 156,547 L180,547 C182.209,547 184,545.209 184,543 L184,519 C184,516.791 182.209,515 180,515 L180,515 Z" id="save-floppy" sketch:type="MSShapeGroup"></path>
              </g>
            </g>
          </svg>
          `,
                        render: ({ model, el }) => {
                            el.innerHTML =
                                `
              <div style="position: relative;">
                <button type="button" style="background: transparent; border: 0; font-weight: bold; line-height: 1; position: absolute; top: -10px; right: -20px; cursor: pointer; z-index: 999999999;" id="${section._id}">  
                    <svg style="position: relative; top: .125em; flex-shrink: 0;" xmlns="http://www.w3.org/2000/svg" width="30px" height="20px" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6" stroke="#cacaca" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
              </div>` + el.innerHTML;
                            el.addEventListener("click", () => {
                                const removeButton = document.getElementById(
                                    `${section._id}`
                                );
                                const modal = editor.Modal;
                                removeButton.addEventListener(
                                    "click",
                                    async function () {
                                        modal.setTitle("Confirm Delete");
                                        modal.setContent(`
                  <label style="width: 100%; display: block; text-align: center; margin-bottom: 6px;">Are you sure you want to delete this saved section?</label>
                  <div class="modal-button-container">
                    <button id="cancel_${section._id}" class="modal-button" style="margin-right: 10px; background: transparent; border: 1px solid #eee; color: #eee;">Cancel</button>
                    <button id="confirm_${section._id}" class="modal-button" style="background-color: red">Delete Section</button>
                  </div>
                `);
                                        modal.open();
                                        const confirmButton =
                                            document.getElementById(
                                                `confirm_${section._id}`
                                            );
                                        const cancelButton =
                                            document.getElementById(
                                                `cancel_${section._id}`
                                            );
                                        confirmButton.addEventListener(
                                            "click",
                                            async function () {
                                                document.getElementById(
                                                    "saving-overlay"
                                                ).style.display = "block";
                                                fetch(
                                                    `${baseUrl}/sections/${section._id}`,
                                                    {
                                                        method: "DELETE",
                                                        headers: {
                                                            "Content-Type":
                                                                "application/json",
                                                            Authorization: `Bearer ${sessionToken}`,
                                                        },
                                                    }
                                                )
                                                    .then(() => {
                                                        editor.BlockManager.remove(
                                                            "savedSection_" +
                                                                section._id
                                                        );
                                                    })
                                                    .catch(err =>
                                                        console.error(err)
                                                    )
                                                    .finally(() => {
                                                        document.getElementById(
                                                            "saving-overlay"
                                                        ).style.display =
                                                            "none";
                                                    });
                                                modal.close();
                                            }
                                        );
                                        cancelButton.addEventListener(
                                            "click",
                                            async function () {
                                                modal.close();
                                            }
                                        );
                                    }
                                );
                            });
                        },
                        content: {
                            type: section.json.type,
                            components: section.json,
                        },
                        category: { id: "custom", label: "Saved Sections" },
                    });
                });
            });
        });
}

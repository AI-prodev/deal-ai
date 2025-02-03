// Trait visual effect relatives
var traitsProps
var traitStyle

function toggleTraitSector(show = false){

  var hidden = traitStyle.display == 'none';

  if (hidden || show) {
    traitStyle.display = 'block';
    $('#triangle').css('transform', 'rotate(0deg)');
  } else {
    traitStyle.display = 'none';
    $('#triangle').css('transform', 'rotate(-90deg)');
  }
  let elements = document.querySelectorAll('div[title="Href"]');
  for (const element of elements) {
    element.setAttribute('title', 'URL');
    element.innerHTML =  'URL';
  }
}

/**
 * Function to show the general tab in the editor.
 *
 * @param {Editor} editor - the editor object
 * @return {void} 
 */
function showGeneralTab(editor) {
  selectedStyleTab = styleTabs.general;
  editor.StyleManager.addStyleTargets({
    "padding-top": paddingTop,
    "padding-bottom": paddingBottom,
    "padding-left": paddingLeft,
    "padding-right": paddingRight,
  });

  $(".gjs-sm-sector.advanced").css("opacity", "0.5");
  $(".gjs-sm-sector.general").css("opacity", "1");

  Object.values(advancedStyles).forEach((style) => (style.display = "none"));
  Object.values(easyStyles).forEach((style) => (style.display = "block"));

  let elements = document.querySelectorAll('div[title="Href"]');
  for (const element of elements) {
    element.setAttribute("title", "URL");
    element.innerHTML = "URL";
  }
}

const singleItem = (textColor: string) => {
  return (
    '<li><a href="${item.path}" style="text-decoration: none;' +
    `color: ${textColor}` +
    '">${item.title}</a></li>'
  );
};

export const getMenuItems = (textColor: string) => {
  return `
    const menu = [];
    const navbarItems = document.getElementById("menu-items");
    
    function populateMenu(menuItems) {
      navbarItems.innerHTML = "";
      menuItems.forEach((item) => {
        navbarItems.innerHTML += \`${singleItem(textColor)}\`;
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
      const requestUrl = baseUrl + "/funnels/" + funnelId + "/menus";
      fetch(requestUrl)
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
  `;
};

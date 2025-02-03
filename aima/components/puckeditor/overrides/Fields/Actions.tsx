import { FieldLabel, usePuck } from "@measured/puck";
import { Button, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
const ZONES = ["Columns", "FullWidth", "Wide", "Medium", "Small"];
import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    background: {
      default: "#90caf9",
    },
    action: {
      disabledBackground: "rgba(144, 202, 249, 0.5)",
      hover: "#42a5f5",
    },
  },
});

const Actions = () => {
  const { appState, dispatch, selectedItem } = usePuck();
  const [clipboard, setClipboard] = useState<null | {
    type: string;
    props: any;
  }>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    //@ts-ignore
    if (selectedItem && !ZONES.includes(selectedItem?.type)) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    const clipboardData = sessionStorage.getItem("clipboard");
    if (clipboardData) setClipboard(JSON.parse(clipboardData));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      const code = event.which || event.keyCode;
      let charCode = String.fromCharCode(code).toLowerCase();

      if ((event.ctrlKey || event.metaKey) && charCode === "c") {
        handleCopy();
      } else if ((event.ctrlKey || event.metaKey) && charCode === "v") {
        handlePaste();
      } else if ((event.ctrlKey || event.metaKey) && charCode === "x") {
        handleCut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem]);

  const handleCopy = (): void => {
    if (selectedItem) {
      sessionStorage.setItem("clipboard", JSON.stringify({ selectedItem }));
      //@ts-ignore
      setClipboard(selectedItem);
    }
  };

  const handleCut = () => {
    handleCopy();

    dispatch({
      type: "setData",
      data: previous => {
        const selectedItemId = selectedItem?.props?.id;
        const zone = selectedItemId?.split("-").at(0);
        const zoneKey = `${selectedItemId}:${zone}${zone === "Columns" ? "-0" : ""}`;

        if (previous?.zones?.[zoneKey]) {
          delete previous.zones[zoneKey];
          previous.content = previous.content.filter(
            item => item.props.id !== selectedItemId
          );

          return previous;
        }

        const zones = previous?.zones;
        if (zones && selectedItemId) {
          Object.keys(zones).forEach((key: string) => {
            zones[key] = zones[key].filter(
              (item: any) => item.props.id !== selectedItemId
            );
          });
        }

        return previous;
      },
    });
  };

  const handlePaste = () => {
    dispatch({
      type: "setData",
      data: previous => {
        const selectedItemId = selectedItem?.props?.id;
        const selectedItemZone = selectedItemId?.split("-").at(0);
        const selectedItemZoneKey = `${selectedItemId}:${selectedItemZone}${selectedItemZone === "Columns" ? "-0" : ""}`;
        const element = sessionStorage.getItem("clipboard");

        if (previous?.zones?.[selectedItemZoneKey] && element) {
          const pastElement = JSON.parse(element);
          const pastElementId = pastElement?.selectedItem?.props?.id;
          const pastElementType = pastElementId?.split("-").at(0) as string;

          if (ZONES.includes(pastElementType)) {
            if (pastElementType === "Columns") {
              const zones = {};
              const uuId = crypto.randomUUID();

              for (const key in appState?.data?.zones) {
                if (key.includes(pastElementId as string)) {
                  const type = key.split("-").at(0);
                  const zone = key.split(":").at(1);

                  //@ts-ignore
                  zones[`${type}-${uuId}:${zone}`] = appState?.data?.zones[
                    key
                  ]?.map(item => ({
                    ...item,
                    props: {
                      ...item?.props,
                      id: `${type}-${crypto.randomUUID()}`,
                    },
                  }));
                }
              }

              return {
                ...previous,
                zones: {
                  ...previous.zones,
                  ...zones,
                  [selectedItemZoneKey]: [
                    ...previous.zones?.[selectedItemZoneKey],
                    {
                      ...pastElement?.selectedItem,
                      props: {
                        ...pastElement?.selectedItem.props,
                        id: `${pastElementType}-${uuId}`,
                      },
                    },
                  ],
                },
              };
            }
            const changedItems: any[] = [];
            const zones = {};
            const zoneKey = `${pastElementId}:${pastElementType}`;
            const items = appState?.data?.zones?.[zoneKey];

            items?.forEach((item: any) => {
              if (ZONES.includes(item?.type)) {
                const uuid = crypto.randomUUID();

                for (const key in appState?.data?.zones) {
                  if (key.includes(item.props.id)) {
                    const type = key.split("-").at(0);
                    const zone = key.split(":").at(1);

                    if (item?.props?.id.startsWith("Columns")) {
                      changedItems.push({
                        ...item,
                        props: {
                          ...item?.props,
                          id: `${type}-${uuid}`,
                        },
                      });
                      //@ts-ignore
                      item?.props?.columns?.forEach((_, index) => {
                        //@ts-ignore
                        zones[`${type}-${uuid}:Columns-${index}`] = //@ts-ignore
                          appState?.data?.zones[
                            `${key.split(":").at(0)}:Columns-${index}`
                          ]?.map(item => ({
                            ...item,
                            props: {
                              ...item?.props,
                              id: crypto.randomUUID(),
                            },
                          }));
                      });
                      return;
                    }
                    //@ts-ignore
                    zones[`${type}-${uuid}:${zone}`] = appState?.data?.zones[
                      key
                    ]?.map(item => ({
                      ...item,
                      props: {
                        ...item?.props,
                        id: crypto.randomUUID(),
                      },
                    }));

                    changedItems.push({
                      ...item,
                      props: {
                        ...item?.props,
                        id: `${type}-${uuid}`,
                      },
                    });
                    return;
                  }
                }
              }
              changedItems.push({
                ...item,
                props: {
                  ...item?.props,
                  id: `${pastElementType}-${crypto.randomUUID()}`,
                },
              });
            });
            const zoneId = crypto.randomUUID();
            //@ts-ignore
            zones[`${pastElementType}-${zoneId}:${pastElementType}`] =
              changedItems;

            return {
              ...previous,
              zones: {
                ...previous.zones,
                ...zones,
                [selectedItemZoneKey]: [
                  ...previous.zones?.[selectedItemZoneKey],
                  {
                    ...pastElement?.selectedItem,
                    props: {
                      ...pastElement?.selectedItem.props,
                      id: `${pastElementType}-${zoneId}`,
                    },
                  },
                ],
              },
            };
          }

          return {
            ...previous,
            zones: {
              ...previous.zones,
              [selectedItemZoneKey]: [
                ...previous.zones?.[selectedItemZoneKey],
                {
                  ...pastElement?.selectedItem,
                  props: {
                    ...pastElement?.selectedItem.props,
                    id: `${pastElementType}-${crypto.randomUUID()}`,
                  },
                },
              ],
            },
          };
        }

        return previous;
      },
    });

    setClipboard(null);
  };

  return (
    <div className="border-b border-[#dcdcdc]">
      <FieldLabel label="Actions" className="p-4">
        <Tooltip title="Copy" placement="bottom">
          <Button
            component="label"
            variant="contained"
            size={"large"}
            onClick={handleCopy}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
              />
            </svg>
          </Button>
        </Tooltip>
        <Tooltip title="Cut" placement="bottom">
          <Button
            component="label"
            variant={"contained"}
            onClick={handleCut}
            size={"large"}
            sx={{
              marginLeft: 1.5,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m7.848 8.25 1.536.887M7.848 8.25a3 3 0 1 1-5.196-3 3 3 0 0 1 5.196 3Zm1.536.887a2.165 2.165 0 0 1 1.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 1 1-5.196 3 3 3 0 0 1 5.196-3Zm1.536-.887a2.165 2.165 0 0 0 1.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863 2.077-1.199m0-3.328a4.323 4.323 0 0 1 2.068-1.379l5.325-1.628a4.5 4.5 0 0 1 2.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.33 4.33 0 0 0 10.607 12m3.736 0 7.794 4.5-.802.215a4.5 4.5 0 0 1-2.48-.043l-5.326-1.629a4.324 4.324 0 0 1-2.068-1.379M14.343 12l-2.882 1.664"
              />
            </svg>
          </Button>
        </Tooltip>
        <ThemeProvider theme={theme}>
          <Tooltip title="Paste" placement="bottom">
            <Button
              component="label"
              variant="contained"
              size={"large"}
              disabled={!clipboard || isDisabled}
              onClick={handlePaste}
              sx={{
                marginLeft: 1.5,
                backgroundColor: "#90caf9",
                "&:hover": {
                  backgroundColor: "#42a5f5",
                },
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="rgba(0, 0, 0, 0.87)"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                />
              </svg>
            </Button>
          </Tooltip>
          {clipboard?.type && (
            <p className="mt-4">Clipboard: {clipboard?.type}</p>
          )}
        </ThemeProvider>
      </FieldLabel>
    </div>
  );
};

export default Actions;

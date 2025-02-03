import { getSession } from "next-auth/react";
import { showErrorToast, showErrorToastResize } from "./toast";

interface Shape {
  status: string;
  inpaint?: {
    prompt: string;
    selection: any;
    results: string[];
  };
  backgroundImage?: string;
}

interface Control {
  activeShape: Shape;
  onupdate: (update: any) => void;
  ongenerate: (generate: any) => void;
  labelEdit?: string;
  labelGenerate?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000";

const fetchWithAuth = async (
  url: string,
  options: RequestInit
): Promise<Response> => {
  const session = await getSession();
  const headers = new Headers(options.headers);

  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const modifiedOptions = { ...options, headers };

  try {
    const response = await fetch(url, modifiedOptions);
    if (!response.ok) {
      const errorData = await response.json(); // Assuming the error response is in JSON format
      const errorMessage = errorData.message || "An unknown error occurred";

      console.error("Fetch error:", errorMessage, "Status:", response.status);

      if (response.status === 429) {
        showErrorToast("Rate limit exceeded. Please try again later.");
      } else if (response.status === 401 || response.status === 403) {
        showErrorToast("You are not authorized to perform this action.");
      } else {
        showErrorToast(errorMessage);
      }

      //throw new Error(errorMessage);
    }
    return response;
  } catch (error) {
    console.error("Network error:", error);
    showErrorToast("A network error occurred. Please try again.");
    throw error; // Rethrow the error for further handling by the caller
  }
};
export const appendRetouchInpaintButtons = (
  controls: any[],
  {
    activeShape,
    onupdate,
    ongenerate,
    labelEdit = "Edit prompt",
    labelGenerate = "Generate more",
  }: Control
): void => {
  if (activeShape.status === "loading" || !activeShape.inpaint) return;

  const { prompt, selection } = activeShape.inpaint;

  controls.push([
    "div",
    "promptnav",
    {
      class: "PinturaShapeControlsGroup",
    },
    [
      [
        "Button",
        "edit",
        {
          icon: `<path d="M15,5 C17.7614237,5 20,7.23857625 20,10 L20,14 C20,16.7614237 17.7614237,19 15,19 L9,19 C7.33333333,19 5.66666667,19.6666667 4,21 C4.46065808,19.6180258 4.96110477,18.4747831 5.50134005,17.5702721 C4.57467285,16.664034 4,15.399128 4,14 L4,10 C4,7.23857625 6.23857625,5 9,5 L15,5 Z M8.5,14 L8,16 L10,15.5 L8.5,14 Z M13,9.5 L9,13.5 L10.5,15 L14.5,11 L13,9.5 Z M14.5,8 L13.5,9 L15,10.5 L16,9.5 L14.5,8 Z" fill="currentColor"/>`,
          label: labelEdit,
          hideLabel: true,
          onclick: () => onupdate({ shapePrompt: prompt }),
        },
      ],
      [
        "Button",
        "refresh",
        {
          icon: `<path d="M16.8108172,6.91509368 C15.5565287,5.72800578 13.8632818,5 12,5 C8.13400675,5 5,8.13400675 5,12 C5,15.8659932 8.13400675,19 12,19 C15.8659932,19 19,15.8659932 19,12" fill="none" stroke="currentColor" stroke-width="2"/><polygon fill="currentColor" points="17.5 4 14.5 8.5 20 9"/><g fill="currentColor"><circle cx="9" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></g>`,
          label: labelGenerate,
          hideLabel: true,
          onclick: () =>
            ongenerate({
              shapePrompt: prompt,
              shapeSelection: selection,
            }),
        },
      ],
    ],
  ]);
};

interface NavigationControl {
  activeShape: Shape;
  onupdate: (update: any) => void;
  labelPrevious?: string;
  labelNext?: string;
}

export const appendRetouchInpaintResultNavigation = (
  controls: any[],
  {
    activeShape,
    onupdate,
    labelPrevious = "Previous",
    labelNext = "Next",
  }: NavigationControl
): void => {
  if (
    activeShape.status === "loading" ||
    !activeShape.inpaint ||
    activeShape.inpaint.results.length <= 1
  )
    return;

  const updateShapeWithIndex = (
    getIndex: (currentIndex: number, length: number) => number
  ): void => {
    const { results } = activeShape.inpaint!;
    const currentResultIndex = results.findIndex(
      result => result === activeShape.backgroundImage
    );
    const nextResultIndex = getIndex(currentResultIndex, results.length);
    onupdate({ shapeBackgroundImage: results[nextResultIndex] });
  };

  const next = (): void =>
    updateShapeWithIndex((i, l) => (i + 1 >= l ? 0 : i + 1));
  const prev = (): void =>
    updateShapeWithIndex((i, l) => (i === 0 ? l - 1 : i - 1));

  controls.push([
    "div",
    "resultnav",
    {
      class: "PinturaShapeControlsGroup",
    },
    [
      [
        "Button",
        "previous",
        {
          label: labelPrevious,
          hideLabel: true,
          icon: '<path fill="currentColor" d="M 16 16 16 8 8 12 z"/>',
          onclick: prev,
        },
      ],
      [
        "Button",
        "next",
        {
          label: labelNext,
          hideLabel: true,
          icon: '<path fill="currentColor" d="M 16 12 8 16 8 8 z"/>',
          onclick: next,
        },
      ],
    ],
  ]);
};

interface FeatherSliderControl {
  value?: string;
  onchange: (value: any) => void;
  labelFeather?: string;
  options?: [string, string][];
}

export const appendRetouchFeatherSlider = (
  controls: any[],
  {
    value,
    onchange,
    labelFeather = "Feather edges",
    options = [
      ["0", "Disabled"],
      ["1%", "Small"],
      ["2.5%", "Medium"],
      ["5%", "Large"],
    ],
  }: FeatherSliderControl
): any[] => {
  if (value === undefined) return controls;

  controls.push([
    "div",
    "imageblend",
    {
      class: "PinturaShapeControlsGroup",
    },
    [
      [
        "Dropdown",
        "feather",
        {
          label: labelFeather,
          options,
          value,
          onchange,
        },
      ],
    ],
  ]);

  return controls;
};

interface Editor {
  imageSelection(
    editor: Editor,
    createRetouchShape: CreateRetouchShapeFunc,
    text: string,
    imageSelection: any
  ): unknown;
  imageFile: Blob;
  imageSize: { width: number; height: number };
  imageState: any;
  imageManipulation: any[];
  on: (event: string, callback: (items: any[]) => void) => void;
  showTextInput: (
    onConfirm: (text: string) => void,
    onCancel: (err: any) => void,
    config: any
  ) => void;
  hideTextInput: () => void;
  updateImage: any;
  status?: string | undefined;
  util?: string;
}

type CreateRetouchShapeFunc = (
  imageFile: Blob,
  imageSize: { width: number; height: number },
  imageState: any,
  selection: any,
  inpaintingFunction: (
    imageBlob: Blob,
    maskBlob: Blob,
    context: { shape: any; controller: AbortController }
  ) => Promise<void>,
  editorParams: any
) => Promise<any>;

export const createInpaintShape = (
  editor: Editor,
  createRetouchShape: CreateRetouchShapeFunc,
  prompt: string,
  selection: any,
  targetShape?: any
): Promise<void> => {
  return createRetouchShape(
    editor.imageFile,
    editor.imageSize,
    editor.imageState,
    selection,
    async (imageBlob, maskBlob, { shape, controller }) => {
      const results = await requestInpaintResults(imageBlob, maskBlob, prompt, {
        debug: false,
        count: 4,
        controller,
      });

      if (!results) throw new Error("Something went wrong");

      Object.assign(shape, {
        backgroundImage: results[0],
        feather: "1%",
        isSelected: true,
        inpaint: {
          ...shape.inpaint,
          results: [...results, ...(shape.inpaint?.results || [])],
        },
      });
    },
    {
      padding: 0,
      targetSize: {
        width: 512,
        height: 512,
      },
      forceSquareCanvas: true,
      retouches: targetShape
        ? editor.imageManipulation.filter(shape => shape.id !== targetShape.id)
        : editor.imageManipulation,
      didCreateDraft: (
        draftShape: {
          inpaint: {
            prompt: string;
            results: never[];
            selection: any[];
          };
          id: any;
        },
        { selection }: any
      ) => {
        if (targetShape) {
          Object.assign(draftShape, targetShape);
          draftShape.inpaint = targetShape.inpaint;
          editor.imageManipulation = editor.imageManipulation.map(shape => {
            return shape.id !== draftShape.id ? shape : draftShape;
          });
        } else {
          draftShape.inpaint = {
            prompt,
            results: [],
            selection: [...selection],
          };
          editor.imageManipulation = [...editor.imageManipulation, draftShape];
        }
      },
    }
  ).then(finalShape => {
    editor.imageManipulation = editor.imageManipulation.map(shape => {
      return shape.id !== finalShape.id ? shape : finalShape;
    });
  });
};

export const requestInpaintPrompt = (
  editor: Editor,
  {
    text = "",
    onconfirm,
    onerror,
    onclose,
  }: {
    text?: string;
    onconfirm?: (text: string) => void;
    onerror?: (err: any) => void;
    onclose?: () => void;
  }
): void => {
  if (!onconfirm) return;

  const handleTextInputConfirm = (text: string): void => {
    onconfirm(text);
    onclose && onclose();
  };

  const handleTextInputCancel = (err: any): void => {
    if (err) onerror && onerror(err);
    onclose && onclose();
  };

  editor.showTextInput(handleTextInputConfirm, handleTextInputCancel, {
    align: "top",
    justify: "center",
    text,
    placeholder: "Leave empty to use background",
    buttonConfirm: {
      label: "Generate",
    },
    buttonCancel: {
      hideLabel: true,
      label: "Cancel",
      icon: '<g stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></g>',
    },
  });
};

export const createCleanShape = (
  editor: Editor,
  createRetouchShape: CreateRetouchShapeFunc,
  selection: any
): Promise<void> => {
  return createRetouchShape(
    editor.imageFile,
    editor.imageSize,
    editor.imageState,
    selection,
    async (imageBlob, maskBlob, { shape, controller }) => {
      const backgroundBlob = await requestCleanResult(imageBlob, maskBlob, {
        controller,
        debug: false,
      });

      shape.backgroundImage = URL.createObjectURL(backgroundBlob);
    },
    {
      padding: 40,
      retouches: editor.imageManipulation,
      didCreateDraft: (draftShape: any) => {
        editor.imageManipulation = [...editor.imageManipulation, draftShape];
      },
    }
  ).then(finalShape => {
    editor.imageManipulation = editor.imageManipulation.map(shape => {
      return shape.id !== finalShape.id ? shape : finalShape;
    });
  });
};

export const attachCleanAction = (
  editor: Editor,
  createRetouchShape: CreateRetouchShapeFunc
): void => {
  editor.on("selectionup", selectionItems => {
    const lastSelectionItem = selectionItems[selectionItems.length - 1];
    if (!lastSelectionItem || lastSelectionItem.action !== "clean") return;

    if (editor?.imageSize?.width > 2048 || editor?.imageSize?.height > 2048) {
      editor.status = undefined;
      showErrorToastResize(
        "Please resize your image to 2048x2048 or smaller to use this tool"
      );

      editor.imageSelection = [] as any;
      return;
    }
    const currentSelection: any[] = [...(editor.imageSelection as any)];
    editor.imageSelection = [] as any;

    createCleanShape(editor, createRetouchShape, currentSelection);
  });
};

export const attachInpaintAction = (
  editor: Editor,
  createRetouchShape: CreateRetouchShapeFunc
): void => {
  editor.on("selectiondown", () => {
    editor.hideTextInput();
  });

  editor.on("selectionup", selectionItems => {
    const lastSelectionItem = selectionItems[selectionItems.length - 1];
    if (!lastSelectionItem || lastSelectionItem.action !== "inpaint") return;

    requestInpaintPrompt(editor, {
      onconfirm: text => {
        createInpaintShape(
          editor,
          createRetouchShape,
          text,
          editor.imageSelection
        );
      },
      onclose: () => {
        editor.imageSelection = [] as any;
      },
      onerror: err => {
        // handle error
      },
    });
  });
};

const requestCleanResult = (
  imageBlob: Blob,
  maskBlob: Blob,
  options: { controller: AbortController; debug?: boolean }
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    const { controller, debug = false } = options;
    if (debug) {
      const imgA = new Image();
      imgA.src = URL.createObjectURL(imageBlob);
      const imgB = new Image();
      imgB.src = URL.createObjectURL(maskBlob);
      document.body.append(imgA, imgB);
    }

    const form = new FormData();

    form.append("image", imageBlob);
    form.append("mask", maskBlob);
    try {
      const res = await fetchWithAuth(`${baseUrl}/clean/image`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      const blob = await res.blob();
      if (debug) {
        console.error({ outputBlob: blob });
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        document.body.append(img);
      }

      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
};

const requestInpaintResults = (
  imageBlob: Blob,
  maskBlob: Blob,
  prompt: string,
  options: { controller: AbortController; count: number; debug?: boolean }
): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    const { controller, count, debug = false } = options;
    let didAbort = false;

    if (debug) {
      const imgA = new Image();
      imgA.src = URL.createObjectURL(imageBlob);
      const imgB = new Image();
      imgB.src = URL.createObjectURL(maskBlob);
      document.body.append(imgA, imgB);
    }

    const formData = new FormData();
    formData.append("image", imageBlob);
    formData.append("mask", maskBlob);
    formData.append("prompt", prompt);
    formData.append("outputs", count.toString());

    try {
      const startRes = await fetchWithAuth(`${baseUrl}/inpaint/start`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const startData = await startRes.json();

      if (!startRes.ok) {
        showErrorToast("Inpainting start failed");
        throw new Error("Inpainting start failed");
      }

      const { id } = startData;
      let pollId: string | number | NodeJS.Timeout | undefined;
      controller.signal.onabort = () => {
        clearTimeout(pollId);
        didAbort = true;
        reject(new Error("Aborted"));
      };

      let pollAttempt = 0;
      const MaxAttempts = 20;
      const poll = async () => {
        if (didAbort) return;

        if (pollAttempt >= MaxAttempts) {
          reject(new Error("Timed out"));
          return;
        }

        pollAttempt++;
        const pollRes = await fetchWithAuth(
          `${baseUrl}/inpaint/status/${id}?bust=${Date.now()}`,
          {
            signal: controller.signal,
          }
        );
        const pollData = await pollRes.json();

        if (!pollRes.ok || !pollData.output) {
          setTimeout(poll, 1000);
          return;
        }

        if (debug) {
          pollData.output.forEach((src: string) => {
            const img = new Image();
            img.src = src;
            document.body.append(img);
          });
        }

        resolve(pollData.output);
      };

      poll();
    } catch (error) {
      reject(error);
    }
  });
};

function convertBlobToPNG(originalBlob: Blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(originalBlob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d") as any;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(pngBlob => {
        resolve(pngBlob);
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.onerror = reject;
    img.src = url;
  });
}
const requestReplaceBackground = (
  imageBlob: Blob,
  prompt: string,
  options: { controller: AbortController; debug?: boolean }
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    const { controller, debug = false } = options;
    if (debug) {
      console.error({ imageBlob });
      const imgA = new Image();
      imgA.src = URL.createObjectURL(imageBlob);

      document.body.append(imgA);
    }

    const form = new FormData();

    form.append("image", imageBlob);
    form.append("prompt", prompt);

    try {
      const res = await fetchWithAuth(`${baseUrl}/replace-background`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      const blob = await res.blob();
      if (debug) {
        console.error({ outputBlob: blob });
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        document.body.append(img);
      }

      const blobPng = (await convertBlobToPNG(blob)) as Blob;
      resolve(blobPng);
    } catch (error) {
      reject(error);
    }
  });
};

// The new function for replacing the background

let history = [] as any;
let historyIndex = -1;

export const replaceBackgroundShape = async (
  editor: Editor,
  createRetouchShape: CreateRetouchShapeFunc,
  backgroundImagePrompt: string,
  selection: any
) => {
  const preActionState = editor.imageFile ? editor.imageFile : null;
  history = preActionState
    ? [...history.slice(0, historyIndex + 1), preActionState]
    : history;
  historyIndex++;

  return createRetouchShape(
    editor.imageFile,
    editor.imageSize,
    editor.imageState,
    selection,
    async (imageBlob, maskBlob, { shape, controller }) => {
      editor.status = "Replacing Background…";
      const imageBlobs = (await convertBlobToPNG(editor?.imageFile)) as Blob;
      try {
        const backgroundBlob = await requestReplaceBackground(
          imageBlobs,
          backgroundImagePrompt,
          { controller, debug: false }
        );

        history = [...history.slice(0, historyIndex + 1), backgroundBlob];
        historyIndex++;
        editor.updateImage(backgroundBlob);
        editor.status = undefined;
        editor.util = "retouch";
      } catch (error) {
        console.error("Failed to replace background:", error);
        editor.status = undefined;
        showErrorToast("Failed to replace background.");
      }

      editor.on("undo", () => {
        if (historyIndex > 0) {
          editor.imageSelection = [] as any;
          historyIndex--;
          const previousState = history[historyIndex];
          editor.updateImage(previousState);
        }
      });

      editor.on("redo", () => {
        if (historyIndex < history.length - 1) {
          editor.imageSelection = [] as any;
          historyIndex++;
          const nextState = history[historyIndex];
          editor.updateImage(nextState);
        }
      });
    },
    {
      retouches: editor.imageManipulation,
    }
  );
};

function hideSelectionModePinturaShapeStyle() {
  document
    .querySelectorAll(".PinturaShapeStyle .PinturaShapeStyleLabel")
    .forEach(labelElement => {
      if (
        labelElement &&
        labelElement.textContent &&
        labelElement.textContent.trim() === "Selection mode"
      ) {
        const closestElement = labelElement.closest(".PinturaShapeStyle");
        if (closestElement) {
          (closestElement as HTMLElement).style.display = "none";
        }
      }
    });
}

export const attachBackgroundReplacementAction = (
  editor: Editor,
  createRetouchShape: CreateRetouchShapeFunc
): void => {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        hideSelectionModePinturaShapeStyle();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  editor.on("selectcontrol", (selectcontrol: any) => {
    if (selectcontrol === "selection-ellipse-replace") {
      const currentSelection: any[] = [...(editor.imageSelection as any)];
      if (editor?.imageSize?.width > 2048 || editor?.imageSize?.height > 2048) {
        editor.status = undefined;
        showErrorToastResize(
          "Please resize your image to 2048x2048 or smaller to use this tool"
        );

        editor.hideTextInput();

        editor.imageSelection = [] as any;
        return;
      }

      const pinturaShapeStyleEditor = document.querySelector(
        ".PinturaShapeStyleEditor"
      );

      if (
        pinturaShapeStyleEditor &&
        selectcontrol === "selection-ellipse-replace"
      ) {
        (pinturaShapeStyleEditor as HTMLElement).style.display = "none";
      }

      if (currentSelection) {
        currentSelection.forEach(selection => {
          selection.x = 0;
          selection.y = 0;
          selection.width = editor.imageSize.width;
          selection.height = editor.imageSize.height;
        });
      }

      requestReplaceBackgroundPrompt(editor, {
        onconfirm: text => {
          replaceBackgroundShape(
            editor,
            createRetouchShape,
            text,
            currentSelection
          );
        },
        onclose: () => {
          editor.imageSelection = [] as any;
        },
        onerror: err => {
          editor.status = undefined;
          // handle error
        },
      });
    } else {
      hideSelectionModePinturaShapeStyle();
      const pinturaShapeStyleEditor = document.querySelector(
        ".PinturaShapeStyleEditor"
      ) as HTMLElement;
      if (pinturaShapeStyleEditor) {
        pinturaShapeStyleEditor.style.display = "grid";
      }

      editor.hideTextInput();
    }
  });
  editor.on("selectionup", selectionItems => {
    const lastSelectionItem = selectionItems[selectionItems.length - 1];
    const currentSelection: any[] = [...(editor.imageSelection as any)];
    if (!lastSelectionItem || lastSelectionItem.action !== "replace") return;
    if (editor?.imageSize?.width > 2048 || editor?.imageSize?.height > 2048) {
      editor.status = undefined;
      showErrorToastResize(
        "Please resize your image to 2048x2048 or smaller to use this tool"
      );
      editor.hideTextInput();
      editor.imageSelection = [] as any;
      return;
    }

    if (currentSelection) {
      currentSelection.forEach(selection => {
        selection.x = 0;
        selection.y = 0;
        selection.width = editor.imageSize.width;
        selection.height = editor.imageSize.height;
      });
    }

    requestReplaceBackgroundPrompt(editor, {
      onconfirm: text => {
        replaceBackgroundShape(
          editor,
          createRetouchShape,
          text,
          currentSelection
        );
      },
      onclose: () => {
        editor.imageSelection = [] as any;
      },
      onerror: err => {
        editor.status = undefined;
        // handle error
      },
    });
  });
};

export const requestReplaceBackgroundPrompt = (
  editor: Editor,
  {
    onconfirm,
    onerror,
    onclose,
  }: {
    onconfirm?: (text: string) => void;
    onerror?: (err: any) => void;
    onclose?: () => void;
  }
): void => {
  if (!onconfirm) return;

  const lastBackgroundDescription =
    localStorage.getItem("backgroundReplaceDescription") || "";

  const handleTextInputConfirm = (text: string): void => {
    localStorage.setItem("backgroundReplaceDescription", text);
    onconfirm(text);
    onclose && onclose();
  };

  const handleTextInputCancel = (err: any): void => {
    if (err) onerror && onerror(err);
    onclose && onclose();
  };

  editor.showTextInput(handleTextInputConfirm, handleTextInputCancel, {
    align: "top",
    justify: "center",
    text: lastBackgroundDescription,
    placeholder: "What would you like to see in the background?",
    buttonConfirm: {
      label: "Replace",
    },
    buttonCancel: {
      hideLabel: true,
      label: "Cancel",
      icon: '<g stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></g>',
    },
  });
};

export const appendBackgroundReplaceButton = (
  controls: any[],
  {
    activeShape,
    onupdate,
    ongenerate,
    labelEdit = "Edit prompt",
    labelGenerate = "Generate more",
  }: Control
): void => {
  //@ts-ignore
  if (activeShape.status === "loading" || !activeShape.replace) return;

  //@ts-ignore
  const { prompt, selection } = activeShape.replace;

  controls.push([
    "div",
    "promptnav",
    {
      class: "PinturaShapeControlsGroup",
    },
    [
      [
        "Button",
        "edit",
        {
          icon: `<path d="M15,5 C17.7614237,5 20,7.23857625 20,10 L20,14 C20,16.7614237 17.7614237,19 15,19 L9,19 C7.33333333,19 5.66666667,19.6666667 4,21 C4.46065808,19.6180258 4.96110477,18.4747831 5.50134005,17.5702721 C4.57467285,16.664034 4,15.399128 4,14 L4,10 C4,7.23857625 6.23857625,5 9,5 L15,5 Z M8.5,14 L8,16 L10,15.5 L8.5,14 Z M13,9.5 L9,13.5 L10.5,15 L14.5,11 L13,9.5 Z M14.5,8 L13.5,9 L15,10.5 L16,9.5 L14.5,8 Z" fill="currentColor"/>`,
          label: labelEdit,
          hideLabel: true,
          onclick: () => onupdate({ shapePrompt: prompt }),
        },
      ],
      [
        "Button",
        "refresh",
        {
          icon: `<path d="M16.8108172,6.91509368 C15.5565287,5.72800578 13.8632818,5 12,5 C8.13400675,5 5,8.13400675 5,12 C5,15.8659932 8.13400675,19 12,19 C15.8659932,19 19,15.8659932 19,12" fill="none" stroke="currentColor" stroke-width="2"/><polygon fill="currentColor" points="17.5 4 14.5 8.5 20 9"/><g fill="currentColor"><circle cx="9" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></g>`,
          label: labelGenerate,
          hideLabel: true,
          onclick: () =>
            ongenerate({
              shapePrompt: prompt,
              shapeSelection: selection,
            }),
        },
      ],
    ],
  ]);
};

import React, { useEffect, useRef, useState } from "react";
import { PinturaEditorModal } from "@pqina/react-pintura";
import {
  getEditorDefaults,
  appendDefaultEditor,
  processDefaultImage,

  // used to register retouch plugin and set tools
  setPlugins,
  getShapeById,
  updateShapeById,
  selectionToMask,
  createRetouchShape,
  createMarkupEditorToolStyles,
  createMarkupEditorShapeStyleControls,
  createMarkupEditorSelectionToolStyles,
  createMarkupEditorSelectionTools,
  createDefaultImageScrambler,

  // retouch plugin and locale
  plugin_retouch,
  plugin_retouch_locale_en_gb,
} from "@pqina/pintura";

import {
  appendRetouchInpaintButtons,
  appendRetouchFeatherSlider,
  appendRetouchInpaintResultNavigation,
  requestInpaintPrompt,
  createInpaintShape,
  attachInpaintAction,
  attachCleanAction,
  appendBackgroundReplaceButton,
  attachBackgroundReplacementAction,
  replaceBackgroundShape,
} from "../utils/retouch";
import { showErrorToast } from "@/utils/toast";

interface CustomPinturaEditorModalProps {
  editableImage: any;
  setIsPinturaOpen: (isOpen: boolean) => void;
  onEditComplete: (image: any) => void;
}

const CustomPinturaEditorModal: React.FC<CustomPinturaEditorModalProps> = ({
  editableImage,
  setIsPinturaOpen,
  onEditComplete,
}) => {
  const editorRef = useRef<any>(null);
  setPlugins(plugin_retouch);
  const attachEditorEvents = (editor: any) => {
    if (typeof editor.on === "function") {
      attachInpaintAction(editor, createRetouchShape as any);
      attachCleanAction(editor, createRetouchShape as any);
      attachBackgroundReplacementAction(editor, createRetouchShape as any);
    }
  };
  useEffect(() => {
    if (editorRef.current && (editorRef.current as any).editor) {
      attachEditorEvents((editorRef.current as any).editor);
    }
  }, [editorRef]);

  const customEditorProps = getEditorDefaults({
    enableViewTool: true,
    enableMoveTool: true,
    locale: {
      retouchLabel: "AI Retouch",
      retouchIcon: `
      <g fill="none" fillRule="evenodd"><path fill="currentColor" d="m17 6-2-1-2 1 1-2-1-2 2 1 2-1-1 2zM5.5 5.5 3 4 .5 5.5 2 3 .5.5 3 2 5.5.5 4 3zM9 21l-3-1.5L3 21l1.5-3L3 15l3 1.5L9 15l-1.5 3z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m9.266 6.705 13.529 13.529c-.071.78-.34 1.371-.765 1.796-.425.425-1.015.694-1.796.765h0L6.705 9.266c.071-.78.34-1.371.765-1.796.425-.425 1.015-.694 1.796-.765h0Z"/><path stroke="currentColor" stroke-width="1.5" d="M12 9.5c-.657.323-1.157.657-1.5 1-.343.343-.677.843-1 1.5"/></g>
      `,
    },
    // @ts-ignore
    resizeAspectRatioLocked: true,
    resizeEnableButtonLockAspectRatio: false,
    retouchToolShapes: createMarkupEditorToolStyles({
      // // add redact mode selection styles
      // ...createMarkupEditorSelectionToolStyles("redact"),

      ...createMarkupEditorSelectionToolStyles("replace", {
        tools: ["ellipse"],
      }),

      //   add clean mode selection styles
      ...createMarkupEditorSelectionToolStyles("clean", {
        tools: ["brush"],
      }),
      //  add inpaint mode selection styles
      ...createMarkupEditorSelectionToolStyles("inpaint"),
    }),
    retouchTools: [
      // // Redact group
      // ["Redact", createMarkupEditorSelectionTools("redact")],

      // background replace

      [
        "Magic Background Replace",

        createMarkupEditorSelectionTools("replace", {
          tools: ["ellipse"],
        }),
      ],

      // Clean group
      [
        "Magic Remove",

        createMarkupEditorSelectionTools("clean", {
          tools: ["brush"],
        }),
      ],

      // Inpaint group
      [
        "Magic Insert",

        // Enable all tools
        createMarkupEditorSelectionTools("inpaint"),
      ],
    ],
    retouchShapeControls: createMarkupEditorShapeStyleControls(),

    retouchWillRenderShapeControls: (controls, activeShapeId) => {
      if (!activeShapeId) return controls;

      if (!activeShapeId) return controls;

      const editor = editorRef.current?.editor;

      const activeShape = editor.imageManipulation.find(
        (shape: any) => shape.id === activeShapeId
      );

      appendRetouchInpaintButtons(controls, {
        // @ts-ignore
        editor: editor,
        activeShape,
        onupdate: ({ shapePrompt }) =>
          requestInpaintPrompt(editor, {
            text: shapePrompt,
            onconfirm: text => {
              createInpaintShape(
                editor,
                createRetouchShape as any,
                text,
                activeShape.inpaint.selection,
                activeShape
              );
            },
            onclose: () => {
              editor.imageSelection = [];
            },
            onerror: err => {
              console.error(err); // Handle error
            },
          }),
        ongenerate: ({ shapePrompt, shapeSelection }) => {
          editor.imageSelection = [];
          createInpaintShape(
            editor,
            createRetouchShape as any,
            shapePrompt,
            shapeSelection,
            activeShape
          );
        },
      });

      // Add feather slider
      appendRetouchFeatherSlider(controls, {
        value: activeShape.feather,
        onchange: ({ value }) => {
          editor.imageManipulation = updateShapeById(
            editor.imageManipulation,
            activeShapeId,
            shape => ({ ...shape, feather: value })
          );
        },
      });

      // Add result navigation
      appendRetouchInpaintResultNavigation(controls, {
        activeShape,
        onupdate: ({ shapeBackgroundImage }) => {
          editor.imageManipulation = updateShapeById(
            editor.imageManipulation,
            activeShapeId,
            shape => ({
              ...shape,
              backgroundImage: shapeBackgroundImage,
            })
          );
        },
      });

      return controls;
    },
  });

  return (
    <PinturaEditorModal
      ref={editorRef}
      {...customEditorProps}
      stickers={["🎉", "😄", "👍"]}
      util="crop"
      utils={[
        "crop",
        "resize",
        "retouch",
        "annotate",
        "sticker",
        "filter",
        "finetune",
        "frame",
      ]}
      cropSelectPresetOptions={[
        [undefined, "Custom"],
        [1, "Square"],
        [16 / 9, "Landscape (16:9)"],
        [9 / 16, "Portrait (9:16)"],
        [3 / 1, "X Cover"],
        [16 / 9, "X Post"],
        [2 / 1, "X Card"],
        [9 / 16, "Instagram Story"],
        [1 / 0.8, "Instagram Portrait"],
        [1.91 / 1, "Instagram Landscape"],
        [2.63 / 1, "Facebook Cover"],
        [1.91 / 1, "Facebook Landscape"],
        [4 / 5, "Facebook Portrait Post (4:5)"],
        [2 / 3, "Facebook Tall Post (2:3)"],
      ]}
      cropEnableButtonToggleCropLimit={true}
      className="bg-black"
      src={editableImage}
      onClose={() => setIsPinturaOpen(false)}
      onProcess={onEditComplete}
    />
  );
};

export default CustomPinturaEditorModal;

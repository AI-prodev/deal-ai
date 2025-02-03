"use client";

import React, { FC, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "ckeditor5/build/ckeditor";
import { Field, FieldProps } from "formik";
import { Editor } from "@ckeditor/ckeditor5-core";
import {
  UploadAdapter,
  FileLoader,
} from "@ckeditor/ckeditor5-upload/src/filerepository";
import { baseUrl } from "@/utils/baseUrl";
import { TEXT_EDITOR_CONFIG } from "@/components/TextEditor/constants";

interface ITextEditorProps {
  name: string;
  toolbar?: string[];
  allowedFileSize?: number;
  acceptFileTypes?: string;
}

const TextEditor: FC<ITextEditorProps> = ({
  name,
  toolbar,
  allowedFileSize,
  acceptFileTypes,
}) => {
  const uploadAdapter = (loader: FileLoader): UploadAdapter => {
    return {
      upload: () => {
        return new Promise(async (resolve, reject) => {
          try {
            const file = await loader.file;
            if (!file) {
              reject("No file selected");
              return;
            }

            if (acceptFileTypes) {
              const fileType = file.type;
              if (!acceptFileTypes.includes(fileType)) {
                reject(`File type "${fileType}" not allowed`);
                return;
              }
            }

            if (allowedFileSize) {
              const fileSizeInMB = file.size / (1024 * 1024);
              if (allowedFileSize < fileSizeInMB) {
                reject(
                  `File size exceeds the maximum allowed size of ${allowedFileSize} MB.`
                );
                return;
              }
            }

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${baseUrl}/upload`, {
              method: "POST",
              body: formData,
            });

            const data = await response.json();

            resolve({
              default: data?.imageUrl,
            });
          } catch (error) {
            reject(error);
          }
        });
      },
    };
  };

  const uploadPlugin = (editor: Editor) => {
    // @ts-ignore
    editor.plugins.get("FileRepository").createUploadAdapter = loader => {
      // @ts-ignore
      return uploadAdapter(loader);
    };
  };

  const handleReady = (editor: any) => {
    editor.ui
      ?.getEditableElement()
      ?.parentElement?.insertBefore(
        editor.ui.view.toolbar.element!,
        editor.ui.getEditableElement()!
      );
    uploadPlugin(editor);
  };

  const editorConfig = useMemo(() => {
    if (!toolbar) return TEXT_EDITOR_CONFIG;

    return {
      ...TEXT_EDITOR_CONFIG,
      toolbar,
    };
  }, []);

  return (
    <div className="ck-text-editor">
      <Field
        name={name}
        render={({ field, form, meta }: FieldProps) => (
          <>
            <CKEditor
              // @ts-ignore
              editor={ClassicEditor}
              config={editorConfig}
              data={field.value}
              onChange={(_, editor) => {
                form.setFieldValue(field.name, editor.getData());
              }}
              onBlur={() => {
                form.setFieldTouched(field.name, true);
              }}
              onReady={handleReady}
            />
            {meta.touched && meta.error && (
              <p className="mt-1 text-danger">{meta.error}</p>
            )}
          </>
        )}
      />
    </div>
  );
};

export default TextEditor;

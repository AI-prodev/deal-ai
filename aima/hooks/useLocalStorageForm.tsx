import { useState, useEffect } from "react";

// This generic hook can be used to store and retrieve form values
export const useLocalStorageForm = <T,>(
  key: string,
  initialValues: T
): [T, (values: T) => void] => {
  const [values, setValues] = useState<T>(() => {
    const storedValues = localStorage.getItem(key);
    return storedValues ? JSON.parse(storedValues) : initialValues;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(values));
  }, [key, values]);

  return [values, setValues];
};

export const useSelectiveLocalStorageForm = <T,>(
  initialValues: T,
  sharedKey: string,
  sharedFieldsToSave: (keyof T)[],
  formKey: string,
  formFieldsToSave: (keyof T)[]
): [T, (values: T) => void] => {
  const getSharedFilteredValues = (values: T) => {
    const filteredValues = {} as T;
    sharedFieldsToSave.forEach(field => {
      filteredValues[field] = values[field];
    });
    return filteredValues;
  };

  const getFormFilteredValues = (values: T) => {
    const filteredValues = {} as T;
    formFieldsToSave.forEach(field => {
      filteredValues[field] = values[field];
    });
    return filteredValues;
  };

  const [values, setValues] = useState<T>(() => {
    const sharedStoredValues = localStorage.getItem(sharedKey);
    const formStoredValues = localStorage.getItem(formKey);
    let finalValues = initialValues;

    if (sharedStoredValues) {
      const sharedSavedValues = JSON.parse(sharedStoredValues);
      finalValues = { ...finalValues, ...sharedSavedValues };
    }

    if (formStoredValues) {
      const formSavedValues = JSON.parse(formStoredValues);
      finalValues = { ...finalValues, ...formSavedValues };
    }

    return finalValues;
  });

  useEffect(() => {
    const sharedFilteredValues = getSharedFilteredValues(values);
    localStorage.setItem(sharedKey, JSON.stringify(sharedFilteredValues));
    const formFilteredValues = getFormFilteredValues(values);
    localStorage.setItem(formKey, JSON.stringify(formFilteredValues));
  });

  return [values, setValues];
};

import { AsyncThunkAction } from "@reduxjs/toolkit";

export interface SocratesData {
  professionHistory: string;
  competencies: string;
  negativeCompetencies: string;
  hobbies: string;
  previousAcquisitions: string;
}

interface DispatchProps {
  dispatch: (
    action: AsyncThunkAction<
      { token: any },
      { socData: SocratesData; jwtToken: string },
      any
    >
  ) => void;
}

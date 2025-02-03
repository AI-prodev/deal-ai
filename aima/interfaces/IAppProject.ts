export interface Generation {
  generationNumber: number;
  creations: string[];
}

export interface Application {
  appName: string;
  generations: Generation[];
}

export interface DefaultProjectData {
  _id: string;
  applications: Application[];
}

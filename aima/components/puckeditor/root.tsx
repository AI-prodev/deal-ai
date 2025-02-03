import { ReactNode } from "react";

type DefaultRootProps = {
  title?: string;
  [key: string]: any;
};

export type RootProps = {
  children: ReactNode;
  title: string;
} & DefaultRootProps;

function Root({ children, editMode }: RootProps) {
  return <>{children}</>;
}

export default Root;

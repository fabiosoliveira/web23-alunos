import { ReactNode } from "react";

type Props = {
  condition: unknown;
  children: ReactNode;
};

function If({ condition, children }: Props) {
  if (condition) {
    return <>{children}</>;
  }
  return <></>;
}

export default If;

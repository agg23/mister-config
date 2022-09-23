import React from "react";
import { InvalidRowError } from "./util/status";

interface InvalidRowProps {
  error: InvalidRowError;
}

export const InvalidRowComponent: React.FC<InvalidRowProps> = ({ error }) => {
  return <div>{error.message}</div>;
};

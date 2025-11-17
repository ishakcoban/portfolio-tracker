import React, { type PropsWithChildren } from "react";
import "./SuccessResponse.scss";

type PopupProps = {
  message: string;
  statusCode: number;
} & PropsWithChildren;
export default function SuccessResponse({ message, statusCode }: PopupProps) {
  return (
    <div
      className={
        statusCode == 201 || statusCode == 200 ? "text-success" : "text-danger"
      }
    >
      {message}
    </div>
  );
}

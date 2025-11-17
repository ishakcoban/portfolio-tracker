import type { PropsWithChildren } from "react";
import "./Popup.scss";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
type PopupProps = {
  onClose: () => void;
} & PropsWithChildren;
export default function Popup({ children, onClose }: PopupProps) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-container mt-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="d-flex justify-content-end">
          <HugeiconsIcon
            role="button"
            color="white"
            width={45}
            height={45}
            icon={Cancel01Icon}
            onClick={onClose}
          />
        </div>
        {children}
      </div>
    </div>
  );
}

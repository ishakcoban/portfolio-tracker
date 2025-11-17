import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type PropsWithChildren,
} from "react";
import "./SuccessMessageCard.scss";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

export type SuccessMessageCardRef = {
  openSuccessMessageBox: () => void;
};

type Props = {
  message: string;
};

const SuccessMessageCard = forwardRef<SuccessMessageCardRef, Props>(
  ({ message }, ref) => {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(false);

    const onClose = () => {
      setVisible(false);

      setTimeout(() => {
        setProgress(false);
      }, 300);
    };
    useImperativeHandle(ref, () => ({
      openSuccessMessageBox() {
        setVisible(true);
        setProgress(true);

        const t1 = setTimeout(() => setVisible(false), 5000);
        const t2 = setTimeout(() => setProgress(false), 5300);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      },
    }));
    return (
      <div
        className={`toast-wrapper position-absolute mt-4 ${visible ? "active" : ""}`}
        style={{ right: 0, bottom: 0, marginBottom: 35 }}
      >
        <div className="toast-content">
          <HugeiconsIcon
            className="check"
            role="button"
            color="black"
            width={21}
            height={21}
            icon={Cancel01Icon}
            onClick={onClose}
          />
          <div className="message">
            <span className="text text-1">Success</span>
            <span id="successMessage" className="text text-2">
              {message}
            </span>
          </div>
        </div>
        <i className="fa-solid fa-xmark close" />

        <div id="bcd" className={`progress ${progress ? "active" : ""}`}></div>
      </div>
    );
  }
);

export default SuccessMessageCard;
// export default function SuccessMessageCard({ message }: Props) {
//   const [visible, setVisible] = useState(false);
//   const [progress, setProgress] = useState(false);

//   useEffect(() => {

//       setVisible(true);
//       setProgress(true);

//       const t1 = setTimeout(() => setVisible(false), 5000);
//       const t2 = setTimeout(() => setProgress(false), 5300);

//       return () => {
//         clearTimeout(t1);
//         clearTimeout(t2);
//       };

//   }, []);

//   const onClose = () => {
//     setVisible(false);

//     setTimeout(() => {
//       setProgress(false);
//     }, 300);
//   };

//   return (
//     <div
//       className={`toast-wrapper position-absolute mt-4 ${visible ? "active" : ""}`}
//       style={{ right: 0, bottom: 0, marginBottom: 35 }}
//     >
//       <div className="toast-content">
//         {/* <i className="fas fa-solid fa-check check" /> */}
//         <HugeiconsIcon
//           className="check"
//           role="button"
//           color="black"
//           width={21}
//           height={21}
//           icon={Cancel01Icon}
//           onClick={onClose}
//         />
//         <div className="message">
//           <span className="text text-1">Success</span>
//           <span id="successMessage" className="text text-2">
//             {message}
//           </span>
//         </div>
//       </div>
//       <i className="fa-solid fa-xmark close" />

//       <div id="bcd" className={`progress ${progress ? "active" : ""}`}></div>
//     </div>
//   );
// }

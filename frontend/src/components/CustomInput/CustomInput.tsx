import { useState, type PropsWithChildren } from "react";
import "./CustomInput.scss";
type Props = {
  input_style: { name: string; header: string };
  inputHandler: (event: React.ChangeEvent<HTMLInputElement>) =>  void;
  value:string
} & PropsWithChildren;
export default function CustomInput({ input_style, inputHandler,value }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  const switchPassword = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <>
      <div className="input-wrapper position-relative">
        <div className="input-border py-1 ps-3 pe-3 m d-flex align-items-center justify-content-end">
          {/* Regular Input */}
            <input
              type={input_style.name}
              className="input-style"
              name={input_style.name}
              value={value}
              onChange={inputHandler}
              disabled={input_style.name === "gender"}
            />
       <div>{value}</div>

          {/* Eye Icon for Password */}
          {/*(input_style.name === "password" ||
            input_style.name === "passwordAgain") && (
            <i
              role="button"
              style={{ fontSize: "1.4rem" }}
              className={
                !isVisible ? "fa-regular fa-eye px-2" : "fa-solid fa-eye px-2"
              }
              onClick={switchPassword}
            ></i>
          )*/}

          {/* Chevron Icon for Select Inputs */}
          {/*(input_style.name === "gender" || input_style.name === "city") && (
            <i
              role="button"
              style={{ fontSize: ".8rem" }}
              className="fa-solid fa-chevron-down px-2"
            ></i>
          )*/}
        </div>

        {/* Header */}
        <div
          style={{ fontSize: ".7rem" }}
          className="input-header position-absolute top-0 ms-3 px-2"
        >
          {input_style.header}
        </div>

        {/* Select Dropdown */}
        {/*(input_style.name === "gender" || input_style.name === "city") && (
        <select
          style={{ fontSize: ".7rem" }}
          role="button"
          className="w-100 position-absolute top-0 px-3"
          name="genders"
          id="genders"
          onChange={inputHandler}
        >
          <option className="option" value="">
            Select your gender
          </option>
          <option className="option fw-bold" value="male">
            Male
          </option>
          <option className="option fw-bold" value="female">
            Female
          </option>
        </select>
      )*/}
      </div>
    </>
  );
}

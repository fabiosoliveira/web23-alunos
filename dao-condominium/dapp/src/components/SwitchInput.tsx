import { ChangeEvent, ChangeEventHandler } from "react";

type Props = {
  id: string;
  text: string;
  isChecked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

/**
 * Renders a switch input component.
 *
 * @param {Props} id - The ID of the input element.
 * @param {Props} text - The text to be displayed next to the switch.
 * @param {Props} isChecked - The initial checked state of the switch.
 * @param {Props} onChange - The callback function called when the switch is toggled.
 * @return {JSX.Element} The rendered switch input component.
 */
function SwitchInput({ id, text, isChecked, onChange }: Props) {
  function onSwitchChange(event: ChangeEvent<HTMLInputElement>): void {
    const isChecked = event.target.value === "true";
    event.target.value = `${!isChecked}`;
    onChange(event);
  }

  function getIsChecked(isChecked: boolean): boolean | undefined {
    if (typeof isChecked === "string") {
      return isChecked === "true";
    } else {
      return isChecked;
    }
  }

  return (
    <div className="form-check form-switch d-flex align-items-center mb-3">
      <input
        className="form-check-input"
        type="checkbox"
        id={id}
        checked={getIsChecked(isChecked)}
        onChange={onSwitchChange}
      />
      <label className="form-check-label mb-0 ms-3" htmlFor={id}>
        {text}
      </label>
    </div>
  );
}

export default SwitchInput;

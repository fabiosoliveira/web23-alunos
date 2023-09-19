import { ethers } from "ethers";

type Props = {
  value: number | string;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

/**
 * Renders a dropdown menu for selecting a topic category.
 *
 * @param {Object} Props - The props object containing the following properties:
 *   - onChange: A function that will be called when the selected category changes.
 *   - value: The currently selected category.
 *   - disabled: A boolean value indicating whether the dropdown is disabled.
 * @return {JSX.Element} - The rendered dropdown menu.
 */
function TopicCategory({ onChange, value, disabled }: Props) {
  function onCategoryChange(evt: React.ChangeEvent<HTMLSelectElement>) {
    if (!evt.target.value) return;
    onChange({
      target: { id: "category", value: evt.target.value },
    } as React.ChangeEvent<HTMLInputElement>);
  }

  return (
    <select
      name="category"
      className="form-select px-3"
      value={ethers.toNumber(value)}
      onChange={onCategoryChange}
      disabled={disabled}
    >
      <option value="">Select...</option>
      <option value="0">Decision</option>
      <option value="1">Spent</option>
      <option value="2">Change Quota</option>
      <option value="3">Change Manager</option>
    </select>
  );
}

export default TopicCategory;

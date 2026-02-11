export type RangeConfig = {
  kind: "range";
  param: string;
  label: string;
  min: string;
  max: string;
  step: string;
  value: string;
  format: string;
  precision: string;
};

export type SelectConfig = {
  kind: "select";
  param: string;
  label: string;
  type: string;
  value: string;
  options: string;
};

export type ToggleConfig = {
  kind: "toggle";
  param: string;
  label: string;
  labelOn: string;
  labelOff: string;
  checked: boolean;
};

export type BankControlConfig = RangeConfig | SelectConfig | ToggleConfig;

export type ControlValue = string | number | boolean;
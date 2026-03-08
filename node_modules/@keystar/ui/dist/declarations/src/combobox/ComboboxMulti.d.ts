import { ForwardedRef, ReactElement } from 'react';
import { ComboboxMultiProps } from "./types.js";
/**
 * This component is not accessible, use with caution.
 *
 * A multi-combobox combines a text input with a listbox, and allows users to filter a
 * list of options.
 */
declare const _ComboboxMulti: <T>(props: ComboboxMultiProps<T> & {
    ref?: ForwardedRef<HTMLDivElement>;
}) => ReactElement;
export { _ComboboxMulti as ComboboxMulti };

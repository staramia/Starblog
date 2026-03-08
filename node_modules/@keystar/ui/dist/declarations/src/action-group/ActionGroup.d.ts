import { ReactElement, RefObject } from 'react';
import { ActionGroupProps } from "./types.js";
/** Group related action buttons together. */
declare const _ActionGroup: <T>(props: ActionGroupProps<T> & {
    ref?: RefObject<HTMLDivElement | null>;
}) => ReactElement;
export { _ActionGroup as ActionGroup };

import { Attributes, ReactElement, ReactNode, RefObject } from 'react';
export declare function useHasChild(query: string, ref: RefObject<HTMLElement | null>): boolean;
/**
 * Clone a React element, with optional props. If the value is
 * not a valid React element, return null.
 */
export declare function cloneValidElement<Props>(child: ReactElement<Props> | ReactNode, props?: Partial<Props> & Attributes): ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | null;

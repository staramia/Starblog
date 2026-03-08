import { AriaLabelingProps, CollectionBase, MultipleSelection } from '@react-types/shared';
import { Key, RefObject } from 'react';
import { BaseStyleProps } from "../../dist/keystar-ui-style.js";
export type EditorListboxProps<T> = {
    listenerRef: RefObject<HTMLElement | null>;
    scrollRef?: RefObject<HTMLElement | null>;
    onAction?: (key: Key) => void;
    onEscape?: () => void;
} & CollectionBase<T> & AriaLabelingProps & MultipleSelection & Pick<BaseStyleProps, 'height' | 'width' | 'maxHeight' | 'maxWidth' | 'minHeight' | 'minWidth' | 'UNSAFE_className' | 'UNSAFE_style'>;
export declare function EditorListbox<T extends object>(props: EditorListboxProps<T>): import("react").JSX.Element;

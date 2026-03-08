import { ReactNode } from 'react';
type BlockWrapperProps = {
    attributes?: {
        'data-slate-node': 'element';
        'data-slate-inline'?: true;
        'data-slate-void'?: true;
        dir?: 'rtl';
        ref: any;
    };
    children: ReactNode;
    draggable?: boolean;
};
export declare const BlockWrapper: (props: BlockWrapperProps) => import("react").JSX.Element;
export {};

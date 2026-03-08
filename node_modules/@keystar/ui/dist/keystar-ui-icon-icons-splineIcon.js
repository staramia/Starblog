import { jsxs, Fragment, jsx } from 'react/jsx-runtime';

/** ![splineIcon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjZmZmIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiLz48Y2lyY2xlIGN4PSIxOSIgY3k9IjUiIHI9IjIiLz48Y2lyY2xlIGN4PSI1IiBjeT0iMTkiIHI9IjIiLz48cGF0aCBkPSJNNSAxN0ExMiAxMiAwIDAgMSAxNyA1Ii8+PC9zdmc+) */
const splineIcon = /*#__PURE__*/jsxs(Fragment, {
  children: [/*#__PURE__*/jsx("circle", {
    cx: 19,
    cy: 5,
    r: 2
  }), /*#__PURE__*/jsx("circle", {
    cx: 5,
    cy: 19,
    r: 2
  }), /*#__PURE__*/jsx("path", {
    d: "M5 17A12 12 0 0 1 17 5"
  })]
});

export { splineIcon };

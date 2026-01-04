import { r as reactExports, j as jsxRuntimeExports, o as cn } from "./index-DQY4_xAv.js";
const Input = reactExports.forwardRef(({ className, type, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      type,
      className: cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ref,
      ...props
    }
  );
});
Input.displayName = "Input";
export {
  Input as I
};

import { forwardRef, type ButtonHTMLAttributes, type PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "quiet";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button(
  { children, className, fullWidth = false, type = "button", variant = "secondary", ...props },
  ref
) {
  const classes = ["ui-button", `ui-button--${variant}`];

  if (fullWidth) {
    classes.push("ui-button--full");
  }

  if (className) {
    classes.push(className);
  }

  return (
    <button className={classes.join(" ")} ref={ref} type={type} {...props}>
      {children}
    </button>
  );
});

import * as React from "react";
import { Eye, EyeOff, Copy, Check, Loader } from "lucide-react";
import { cn } from "../lib/index";
import { FormLabel } from "./form";
import { FormFieldSchema } from "./data-form/interface";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  copy?: boolean;
  onTextCopy?: (copiedText: string) => void | Promise<void>;
  onPasswordVisibilityChange?: (isVisible: boolean) => void | Promise<void>;
  decryptPassword?: (value: string) => string | Promise<string>;
  disableCopy?: boolean;
  leftComponent?: React.ReactNode;
  inline?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      copy = true,
      onTextCopy,
      onPasswordVisibilityChange,
      decryptPassword,
      onChange,
      value = "",
      disableCopy = true,
      leftComponent,
      inline = false,
      autoComplete = "off",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [loadingPassword, setLoadingPassword] = React.useState(false);
    const [loadingCopy, setLoadingCopy] = React.useState(false);
    const [decryptedPassword, setDecryptedPassword] =
      React.useState<string>("");
    const [inputValue, setInputValue] = React.useState(value?.toString() || "");

    React.useEffect(() => {
      setInputValue(value?.toString() || "");
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    const handleTogglePassword = async () => {
      setLoadingPassword(true);
      try {
        if (decryptPassword && !decryptedPassword) {
          const decrypted = await decryptPassword(inputValue?.toString() || "");
          setDecryptedPassword(decrypted);
        }
        setShowPassword((prev) => !prev);
        if (onPasswordVisibilityChange) {
          await onPasswordVisibilityChange(!showPassword);
        }
      } catch (error) {
        console.error("Error decrypting password:", error);
      } finally {
        setLoadingPassword(false);
      }
    };

    return (
      <div
        className={cn(
          "relative flex items-center w-full space-x-2",
          inline && "border-none"
        )}
      >
        {leftComponent && (
          <div className="flex items-center">{leftComponent}</div>
        )}
        <input
          type={showPassword ? "text" : type}
          autoComplete={autoComplete}
          className={cn(
            "h-10 flex-grow text-left rounded-md border border-input bg-background pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
            inline
              ? "focus:outline-none focus:ring-0 focus-visible:ring-0 border-none"
              : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
            leftComponent ? "pl-12" : "pl-2"
          )}
          ref={ref}
          value={decryptedPassword || inputValue || ""}
          onChange={handleChange}
          {...props}
        />
        {(type === "password" || copy) && (
          <div className="absolute right-4 flex items-center space-x-2">
            {type === "password" && (
              <button
                type="button"
                className="flex items-center text-sm"
                onClick={handleTogglePassword}
                disabled={loadingPassword}
              >
                {loadingPassword ? (
                  <Loader size={20} className="animate-spin" />
                ) : showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            )}
            {!disableCopy && copy && (
              <button
                type="button"
                className="flex items-center text-sm"
                disabled={loadingCopy}
                onClick={async () => {
                  setLoadingCopy(true);
                  try {
                    let textToCopy = decryptedPassword;
                    if (decryptPassword && !decryptedPassword) {
                      const decrypted = await decryptPassword(
                        inputValue?.toString() || ""
                      );
                      setDecryptedPassword(decrypted);
                      textToCopy = decrypted;
                    }
                    await navigator.clipboard.writeText(
                      textToCopy || inputValue?.toString() || ""
                    );
                    setCopied(true);
                    if (onTextCopy) {
                      await onTextCopy(
                        textToCopy || inputValue?.toString() || ""
                      );
                    }
                  } catch (error) {
                    console.error("Error copying the password:", error);
                  } finally {
                    setLoadingCopy(false);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
              >
                {loadingCopy ? (
                  <Loader size={20} className="animate-spin" />
                ) : copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

const PasswordFieldHeader = ({
  schema: field,
  required,
  setPassword,
}: {
  schema: FormFieldSchema;
  required?: boolean;
  setPassword: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  const TopRightComponent = field.components?.topRight;

  if (!TopRightComponent && !field.generatePassword) {
    return (
      <div>
        <FormLabel>
          {field.label}{" "}
          <span className="font-normal text-sm text-red-500">
            {required && "*"}
          </span>
        </FormLabel>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center m-0">
      <div>
        <FormLabel>
          {field.label}{" "}
          <span className="font-normal text-sm text-red-500">
            {required && "*"}
          </span>
        </FormLabel>
      </div>
      <div className="flex items-center gap-4">
        {TopRightComponent && (
          <div>
            {/* TopRightComponent requires a form context, skipping when not available */}
          </div>
        )}
        {field.generatePassword && (
          <button
            onClick={(e) => {
              e.preventDefault();
              const generatedPassword = field.generatePassword?.();
              setPassword(generatedPassword);
            }}
            className="px-0 text-sm font-medium text-primary hover:text-primary/80 hover:no-underline"
          >
            Generate Password
          </button>
        )}
      </div>
    </div>
  );
};

const PasswordStrengthMeter = ({
  schema: field,
  password,
}: {
  schema: FormFieldSchema;
  password: string | undefined;
}) => {
  const evaluatePassword = () => {
    if (field.evaluatePasswordCriteria && password) {
      return field.evaluatePasswordCriteria(password);
    }
    return [];
  };

  const failedCriteria = evaluatePassword();
  console.log("PasswordStrengthMeter: failedCriteria", failedCriteria);
  const errorCount = failedCriteria.length;
  console.log("PasswordStrengthMeter: errorCount", errorCount);
  const strengthLevel = !password ? 0 : 5 - errorCount;
  console.log("PasswordStrengthMeter: strengthLevel", strengthLevel);

  const getStrengthColor = (level: number) => {
    switch (level) {
      case 0: // All criteria failed
        return "bg-red-500";
      case 1: // 1 criterion met
        return "bg-orange-500";
      case 2: // 2 criteria met
        return "bg-yellow-500";
      case 3: // 3 criteria met
        return "bg-lime-500";
      case 4: // 4 criteria met
        return "bg-green-500";
      case 5: // All criteria met
        return "bg-emerald-600";
      default:
        return "bg-gray-200";
    }
  };

  const getStrengthText = (level: number) => {
    switch (level) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return "No Password";
    }
  };

  return (
    field.evaluatePasswordCriteria && (
      <div className="mt-2 space-y-2">
        <div className="flex gap-1 h-1.5">
          {[0, 1, 2, 3, 4].map((segment) => (
            <div
              key={segment}
              className={cn(
                "h-full w-full rounded-full transition-colors",
                strengthLevel > segment
                  ? getStrengthColor(strengthLevel)
                  : "bg-gray-200"
              )}
            />
          ))}
        </div>
        <p
          className={cn(
            "text-xs transition-colors",
            getStrengthColor(strengthLevel).replace("bg-", "text-")
          )}
        >
          {getStrengthText(strengthLevel)}
        </p>
        {failedCriteria.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Improve password by adding:</p>
            <ul className="list-disc list-inside space-y-1">
              {failedCriteria.map((criterion, index) => (
                <li key={index}>{criterion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  );
};

Input.displayName = "Input";

export { Input, PasswordFieldHeader, PasswordStrengthMeter };

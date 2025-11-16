import { Component, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-screen w-screen items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-2xl">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-4">
                <p>
                  An unexpected error occurred. Our team has been notified and is
                  working to fix the issue.
                </p>
                {this.state.error && (
                  <pre className="mt-2 w-full overflow-auto rounded-lg bg-destructive/10 p-4 text-sm whitespace-pre-wrap break-words">
                    {this.state.error.message}
                  </pre>
                )}
                <div className="flex gap-4">
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                  <Button variant="outline" onClick={this.reset}>
                    Try Again
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

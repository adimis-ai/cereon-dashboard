import { useEffect, useRef, useState } from "react";
import { NavigateFunction } from "react-router-dom";

export interface ResourceSyncConfig<T, S, ListResponse> {
  /**
   * The current resource identifier from the URL or state
   */
  resourceId?: string;

  /**
   * Re-render trigger, can be a state or prop that changes to re-trigger the sync
   */
  reRender?: number;

  /**
   * Base path for the resource URLs
   */
  basePath: string;

  /**
   * Function to fetch a single resource
   */
  fetchResource: (id: string) => Promise<T>;

  /**
   * Function to list resources
   */
  listResources: () => Promise<ListResponse>;

  /**
   * Function to extract resources array from list response
   */
  getResourcesFromResponse: (response: ListResponse) => S[];

  /**
   * Function to get the identifier from a resource
   */
  getResourceId: (resource: S | T) => string;

  /**
   * Optional callback when a resource is loaded
   */
  onResourceLoaded?: (resource: T) => void;

  /**
   * Optional callback when resource list is loaded
   */
  onListLoaded?: (resources: S[]) => void;

  /**
   * Optional function to clear resource data on unmount
   */
  clearResource?: () => void;

  /**
   * Whether to replace the current history entry when navigating
   * @default true
   */
  replaceHistory?: boolean;

  /**
   * Function to navigate to a different resource
   */
  navigate: NavigateFunction;
}

export interface ResourceSyncResult<T> {
  /**
   * The current resource data
   */
  resource: T | null;

  /**
   * Whether the resource is currently loading
   */
  loading: boolean;

  /**
   * Any error that occurred during sync
   */
  error: Error | null;

  /**
   * The current resource ID
   */
  resourceId?: string;
}

export function useResourceSync<T, S, ListResponse = any[]>({
  resourceId,
  basePath,
  fetchResource,
  listResources,
  getResourcesFromResponse,
  getResourceId,
  onResourceLoaded,
  onListLoaded,
  clearResource,
  reRender = 0,
  replaceHistory = true,
  navigate,
}: ResourceSyncConfig<T, S, ListResponse>): ResourceSyncResult<T> {
  const previousIdRef = useRef<string | undefined>(undefined);
  const initialLoadRef = useRef(false);
  const [resource, setResource] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const syncResource = async () => {
      try {
        setLoading(true);
        setError(null);

        // If we have a resource ID and it's different from the previous one
        if (resourceId && previousIdRef.current !== resourceId) {
          const result = await fetchResource(resourceId);

          if (!isMounted) return;

          setResource(result);
          onResourceLoaded?.(result);
          previousIdRef.current = resourceId;
          return;
        }

        // Handle the case when there's no resource ID
        if (!resourceId && !initialLoadRef.current) {
          initialLoadRef.current = true;
          const response = await listResources();

          if (!isMounted) return;

          const resources = getResourcesFromResponse(response);
          onListLoaded?.(resources);

          if (resources.length > 0) {
            const latestResource = resources[0];
            if (latestResource) {
              const result = await fetchResource(getResourceId(latestResource));

              if (!isMounted) return;

              setResource(result);
              onResourceLoaded?.(result);
              navigate(`${basePath}/${getResourceId(result)}`, {
                replace: replaceHistory,
              });
            }
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error("An error occurred"));
        console.error("Error in resource sync:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    syncResource();

    return () => {
      isMounted = false;
      clearResource?.();
      previousIdRef.current = undefined;
      initialLoadRef.current = false;
    };
  }, [resourceId, basePath, replaceHistory, navigate, reRender]);

  return {
    resource,
    loading,
    error,
    resourceId,
  };
}

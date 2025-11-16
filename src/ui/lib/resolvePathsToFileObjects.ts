export async function resolvePathsToFileObjects(
  paths: string[]
): Promise<File[]> {
  return Promise.all(
    paths.map(async (path) => {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from path: ${path}`);
      }
      const blob = await response.blob();
      const name = path.split("/").pop() || "file";
      return new File([blob], name);
    })
  );
}

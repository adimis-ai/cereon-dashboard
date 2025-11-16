export type Base64File = {
  name: string;
  content: string;
};

export async function fileToBase64(
  file: File | string
): Promise<Base64File | null> {
  console.log("[fileToBase64] Processing file:", file);
  try {
    // Handle File objects directly
    if (file instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            content: reader.result as string,
          });
        };
        reader.onerror = (error) => {
          console.error("[fileToBase64] FileReader error:", error);
          reject(error);
        };
        reader.readAsDataURL(file);
      });
    }

    // Handle string inputs (URLs or base64)
    if (typeof file === "string") {
      // If already a data URL, return as is
      if (file.startsWith("data:")) {
        return {
          name: "image.png",
          content: file,
        };
      }

      // Handle blob URLs
      if (file.startsWith("blob:")) {
        try {
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = await response.blob();

          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                name: `image.${blob.type.split("/")[1] || "png"}`,
                content: reader.result as string,
              });
            };
            reader.onerror = (error) => {
              console.error("[fileToBase64] FileReader error:", error);
              reject(error);
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("[fileToBase64] Error fetching blob URL:", error);
          return null;
        }
      }

      // Handle regular URLs
      try {
        const response = await fetch(file, {
          mode: "cors",
          credentials: "same-origin",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              name: file.split("/").pop() || "image.png",
              content: reader.result as string,
            });
          };
          reader.onerror = (error) => {
            console.error("[fileToBase64] FileReader error:", error);
            reject(error);
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("[fileToBase64] Error fetching URL:", error);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("[fileToBase64] Unexpected error:", error);
    return null;
  }
}

export function base64ToUrl(base64?: Base64File | null): string {
  try {
    if (!base64?.content) {
      console.log("[base64ToUrl] No valid base64 content provided");
      return "";
    }

    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = base64.content.split(",")[1];

    if (!base64Data) {
      console.log("[base64ToUrl] Invalid base64 content format");
      return "";
    }

    // Get file extension, default to 'png' if not available
    const fileExtension = base64.name?.split(".")?.pop() || "png";

    // Convert base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // Create blob from binary data
    const blob = new Blob([byteArray], {
      type: `image/${fileExtension}`,
    });

    // Create and return object URL
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("[base64ToUrl] Error converting base64 to URL:", error);
    return "";
  }
}

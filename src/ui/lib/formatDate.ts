export const prettifyDate = (date: Date | number): string => {
  let d: Date;
  if (typeof date === "number") {
    // If it's a 10-digit number, treat as seconds since epoch
    if (date.toString().length === 10) {
      d = new Date(date * 1000);
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  const formattedDateTime = d.toLocaleString("en-GB", options);
  return formattedDateTime.replace(",", " at");
};

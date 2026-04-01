function normalizeErrorValue(value) {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  if (typeof value.message === "string") {
    return value.message;
  }

  if (typeof value.error === "string") {
    return value.error;
  }

  return "";
}

export function getApiErrorMessage(error, fallbackMessage) {
  return (
    normalizeErrorValue(error?.response?.data?.message) ||
    normalizeErrorValue(error?.response?.data?.error) ||
    normalizeErrorValue(error?.message) ||
    fallbackMessage
  );
}

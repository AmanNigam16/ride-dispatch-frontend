function getMessageFromCandidate(candidate) {
  if (!candidate) {
    return "";
  }

  if (typeof candidate === "string") {
    return candidate;
  }

  if (typeof candidate === "number") {
    return String(candidate);
  }

  if (typeof candidate === "object") {
    if (typeof candidate.message === "string" && typeof candidate.code === "string") {
      return `${candidate.code}: ${candidate.message}`;
    }

    if (typeof candidate.message === "string") {
      return candidate.message;
    }

    if (typeof candidate.error === "string") {
      return candidate.error;
    }
  }

  return "";
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  const candidates = [
    error?.response?.data?.message,
    error?.response?.data?.error,
    error?.message,
    error
  ];

  for (const candidate of candidates) {
    const message = getMessageFromCandidate(candidate);

    if (message) {
      return message;
    }
  }

  return fallback;
}

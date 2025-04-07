export function parseError(
  error: unknown,
  unknownErrorMessage = "Something went wrong"
): string {
  if (typeof error === "string") return error;
  if (!(error instanceof Error)) return unknownErrorMessage;

  // ethers v6 "reason"
  if ("reason" in error && typeof error.reason === "string") {
    return error.reason;
  }

  if ("shortMessage" in error && typeof error.shortMessage === "string") {
    return error.shortMessage;
  }

  return error.message;
}

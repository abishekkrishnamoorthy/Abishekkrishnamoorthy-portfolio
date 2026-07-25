type Env = {
  API_URL: string;
  API_TIMEOUT_MS: number;
  APP_NAME: string;
  SITE_URL: string;
  RESUME_URL: string;
  GITHUB_URL: string;
  LINKEDIN_URL: string;
  EMAIL: string;
  SCHEDULE_CALL_URL: string;
  GA_MEASUREMENT_ID: string;
};

const required = (key: string, fallback = "") => {
  const value = process.env[key] ?? fallback;
  if (!value && key !== "NEXT_PUBLIC_RESUME_URL" && key !== "NEXT_PUBLIC_SCHEDULE_CALL_URL" && key !== "NEXT_PUBLIC_GA_MEASUREMENT_ID") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env: Env = {
  API_URL: required("NEXT_PUBLIC_API_URL", "http://localhost:4000/api"),
  API_TIMEOUT_MS: Number(required("NEXT_PUBLIC_API_TIMEOUT_MS", "10000")),
  APP_NAME: required("NEXT_PUBLIC_APP_NAME", "Abishek Krishnamoorthy - Portfolio"),
  SITE_URL: required("NEXT_PUBLIC_SITE_URL", "https://abishekkrishnamoorthy.online"),
  RESUME_URL: required("NEXT_PUBLIC_RESUME_URL"),
  GITHUB_URL: required("NEXT_PUBLIC_GITHUB_URL", "https://github.com/"),
  LINKEDIN_URL: required("NEXT_PUBLIC_LINKEDIN_URL", "https://linkedin.com/in/"),
  EMAIL: required("NEXT_PUBLIC_EMAIL", "hello@abishekkrishnamoorthy.online"),
  SCHEDULE_CALL_URL: required("NEXT_PUBLIC_SCHEDULE_CALL_URL"),
  GA_MEASUREMENT_ID: required("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
};

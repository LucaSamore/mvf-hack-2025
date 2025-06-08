export const API_BASE_URL =
  typeof window !== "undefined"
    ? "http://localhost:8000"
    : "http://localhost:8000";

export interface SentimentData {
  sentiment: number;
  sentiment_score: number;
  created_at: string;
  comment: string;
}

export interface EngagementData {
  engagement: number;
  created_at: string;
  platform: string;
  content: string;
}

export async function fetchSentiments(
  limit: number = 1000,
  vehicle?: string
): Promise<SentimentData[]> {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (vehicle) {
      params.append("vehicle", vehicle);
    }

    const response = await fetch(`${API_BASE_URL}/sentiments?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log(
      "Fetched sentiments:",
      result.data?.length,
      "items for vehicle:",
      vehicle
    );
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error("Error fetching sentiments:", error);
    return [];
  }
}

export async function fetchEngagements(
  vehicle?: string
): Promise<EngagementData[]> {
  try {
    const params = new URLSearchParams();
    if (vehicle) {
      params.append("vehicle", vehicle);
    }

    const response = await fetch(`${API_BASE_URL}/engagements?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log(
      "Fetched engagements:",
      result.data?.length,
      "items for vehicle:",
      vehicle
    );
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error("Error fetching engagements:", error);
    return [];
  }
}

export function calculateAverageSentiment(sentiments: SentimentData[]): number {
  if (sentiments.length === 0) return 0;
  const sum = sentiments.reduce((acc, item) => acc + item.sentiment, 0);
  return sum / sentiments.length;
}

export function calculateSentimentPercentage(sentiments: SentimentData[]): {
  positive: number;
  neutral: number;
  negative: number;
} {
  if (sentiments.length === 0) return { positive: 0, neutral: 0, negative: 0 };

  const counts = sentiments.reduce(
    (acc, item) => {
      if (item.sentiment > 0.1) acc.positive++;
      else if (item.sentiment < -0.1) acc.negative++;
      else acc.neutral++;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const total = sentiments.length;
  return {
    positive: Math.round((counts.positive / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100),
    negative: Math.round((counts.negative / total) * 100),
  };
}

export function calculateAverageEngagement(
  engagements: EngagementData[]
): number {
  if (engagements.length === 0) return 0;
  const sum = engagements.reduce((acc, item) => acc + item.engagement, 0);
  return sum / engagements.length;
}

export async function generateChatResponse(
  question: string,
  context: any[]
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw error;
  }
}

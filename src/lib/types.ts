export interface Submission {
  id: number;
  storage_path: string;
  times_picked: number;
  total_guesses: number;
  avg_score: number;
  created_at: string;
  level_id: number;
  status?: string;
  submitter_id: number;
  submitter: {
    discord_name: string;
    discord_avatar_url: string;
  };
  guesses?: {
    level_id: number;
    amount: number;
  }[];
}

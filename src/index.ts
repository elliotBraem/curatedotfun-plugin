import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface DistributorPlugin {
  name: string;
  initialize(feedId: string, config: Record<string, string>): Promise<void>;
  distribute(feedId: string, content: string): Promise<void>;
  shutdown?(): Promise<void>;
}

export class SupabaseDistributorPlugin implements DistributorPlugin {
  name = "@curatedotfun/supabase";
  private client: SupabaseClient | null = null;
  private tableName: string = "content";
  private dbOps?: any;

  constructor(dbOperations?: any) {
    this.dbOps = dbOperations;
  }

  async initialize(
    feedId: string,
    config: Record<string, string>,
  ): Promise<void> {
    const { supabaseUrl, supabaseKey, tableName } = config;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing required config: supabaseUrl and supabaseKey");
    }

    this.client = createClient(supabaseUrl, supabaseKey);

    if (tableName) {
      this.tableName = tableName;
    }

    // Verify connection and table existence
    const { error } = await this.client
      .from(this.tableName)
      .select("id")
      .limit(1);

    if (error) {
      throw new Error(`Failed to connect to Supabase table: ${error.message}`);
    }
  }

  async distribute(feedId: string, content: string): Promise<void> {
    if (!this.client) {
      throw new Error(
        "Supabase client not initialized. Call initialize() first.",
      );
    }

    const { error } = await this.client.from(this.tableName).insert({
      feed_id: feedId,
      content,
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to distribute content: ${error.message}`);
    }
  }

  async shutdown(): Promise<void> {
    // Nothing to clean up for Supabase client
  }
}

// Expected table schema:
// create table content (
//   id uuid default uuid_generate_v4() primary key,
//   feed_id text not null,
//   content text not null,
//   created_at timestamp with time zone default timezone('utc'::text, now()) not null
// );
// create index content_feed_id_idx on content(feed_id);

export default SupabaseDistributorPlugin;

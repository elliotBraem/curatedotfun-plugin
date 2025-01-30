import { expect, test, describe, beforeEach } from "bun:test";
import { SupabaseDistributor } from "../index";

describe('SupabaseDistributor', () => {
  let distributor: SupabaseDistributor;
  const mockFeedId = 'test-feed';
  const mockContent = 'test content';

  beforeEach(() => {
    distributor = new SupabaseDistributor();
  });

  test('should have correct name', () => {
    expect(distributor.name).toBe('supabase');
  });

  test('should throw error when initializing without config', async () => {
    await expect(distributor.initialize(mockFeedId, {}))
      .rejects
      .toThrow('Missing required config: supabaseUrl and supabaseKey');
  });

  test('should throw error when distributing without initialization', async () => {
    await expect(distributor.distribute(mockFeedId, mockContent))
      .rejects
      .toThrow('Supabase client not initialized');
  });
});

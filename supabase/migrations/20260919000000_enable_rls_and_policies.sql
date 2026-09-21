-- Enable RLS and create policies for We Are Still Here
-- F-CRIT-01 fix: Ensure no anon direct access, only service_role via Edge Functions and authenticated admin via allowlist

-- 1. Enable RLS on all tables
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_allowlist ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing permissive policies if any (idempotent)
DROP POLICY IF EXISTS "no_anon" ON contact_messages;
DROP POLICY IF EXISTS "no_anon_subs" ON newsletter_subscribers;
DROP POLICY IF EXISTS "no_anon_posts" ON news_posts;
DROP POLICY IF EXISTS "no_anon_allowlist" ON admin_allowlist;
DROP POLICY IF EXISTS "public_can_read_published_news" ON news_posts;
DROP POLICY IF EXISTS "admin_full_access" ON contact_messages;
DROP POLICY IF EXISTS "admin_full_access_subs" ON newsletter_subscribers;
DROP POLICY IF EXISTS "admin_full_access_posts" ON news_posts;
DROP POLICY IF EXISTS "admin_allowlist_select" ON admin_allowlist;

-- 3. Deny all anon access by default (service_role bypasses RLS)
CREATE POLICY "no_anon" ON contact_messages FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "no_anon_subs" ON newsletter_subscribers FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "no_anon_posts" ON news_posts FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "no_anon_allowlist" ON admin_allowlist FOR ALL TO anon USING (false) WITH CHECK (false);

-- 4. Public can read only published news (anon)
CREATE POLICY "public_can_read_published_news" ON news_posts
  FOR SELECT TO anon USING (published = true);

-- 5. Authenticated admin via allowlist has full access
CREATE POLICY "admin_full_access" ON contact_messages
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE a.email = auth.jwt() ->> 'email')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE a.email = auth.jwt() ->> 'email')
  );

CREATE POLICY "admin_full_access_subs" ON newsletter_subscribers
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE a.email = auth.jwt() ->> 'email')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE a.email = auth.jwt() ->> 'email')
  );

CREATE POLICY "admin_full_access_posts" ON news_posts
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE a.email = auth.jwt() ->> 'email')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE a.email = auth.jwt() ->> 'email')
  );

CREATE POLICY "admin_allowlist_select" ON admin_allowlist
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE a.email = auth.jwt() ->> 'email')
  );

-- 6. Add CHECK constraints for data integrity (F-LOW-06)
ALTER TABLE news_posts ADD CONSTRAINT IF NOT EXISTS title_ar_len CHECK (char_length(title_ar) BETWEEN 5 AND 200);
ALTER TABLE news_posts ADD CONSTRAINT IF NOT EXISTS title_en_len CHECK (char_length(title_en) BETWEEN 5 AND 200);
ALTER TABLE news_posts ADD CONSTRAINT IF NOT EXISTS cat_check CHECK (category IN ('news','update','event'));
ALTER TABLE news_posts ADD CONSTRAINT IF NOT EXISTS body_ar_len CHECK (char_length(body_ar) > 0 AND char_length(body_ar) <= 20000);
ALTER TABLE news_posts ADD CONSTRAINT IF NOT EXISTS body_en_len CHECK (char_length(body_en) > 0 AND char_length(body_en) <= 20000);

-- 7. Ensure authenticated role can read its own JWT email (for allowlist check)
-- (No additional policy needed for anon)

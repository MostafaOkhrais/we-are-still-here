-- RLS hardening + indexes (follow-up to 20260919000000)
-- Case-insensitive allowlist, performance indexes, contact length guards

-- 1. Performance indexes
CREATE INDEX IF NOT EXISTS idx_admin_allowlist_email ON admin_allowlist(email);
CREATE INDEX IF NOT EXISTS idx_admin_allowlist_email_lower ON admin_allowlist (lower(email));
CREATE INDEX IF NOT EXISTS idx_news_published ON news_posts(published, published_at DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_ip ON contact_messages(ip_hash, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email_norm ON newsletter_subscribers(email_norm);

-- 2. Recreate admin policies with lower() for case-insensitivity
DROP POLICY IF EXISTS "admin_full_access" ON contact_messages;
CREATE POLICY "admin_full_access" ON contact_messages
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE lower(a.email) = lower(auth.jwt() ->> 'email'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE lower(a.email) = lower(auth.jwt() ->> 'email'))
  );

DROP POLICY IF EXISTS "admin_full_access_subs" ON newsletter_subscribers;
CREATE POLICY "admin_full_access_subs" ON newsletter_subscribers
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE lower(a.email) = lower(auth.jwt() ->> 'email'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE lower(a.email) = lower(auth.jwt() ->> 'email'))
  );

DROP POLICY IF EXISTS "admin_full_access_posts" ON news_posts;
CREATE POLICY "admin_full_access_posts" ON news_posts
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE lower(a.email) = lower(auth.jwt() ->> 'email'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE lower(a.email) = lower(auth.jwt() ->> 'email'))
  );

DROP POLICY IF EXISTS "admin_allowlist_select" ON admin_allowlist;
CREATE POLICY "admin_allowlist_select" ON admin_allowlist
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_allowlist a WHERE lower(a.email) = lower(auth.jwt() ->> 'email'))
  );

-- 3. Contact length guards (defense in depth, Edge already validates)
ALTER TABLE contact_messages ADD CONSTRAINT IF NOT EXISTS name_len CHECK (char_length(name) BETWEEN 2 AND 120);
ALTER TABLE contact_messages ADD CONSTRAINT IF NOT EXISTS msg_len CHECK (char_length(message) BETWEEN 10 AND 5000);

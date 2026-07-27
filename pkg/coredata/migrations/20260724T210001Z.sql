-- Copyright (c) 2026 Probo Inc <hello@probo.com>.
--
-- Permission is hereby granted, free of charge, to any person obtaining a copy
-- of this software and associated documentation files (the "Software"), to deal
-- in the Software without restriction, including without limitation the rights
-- to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
-- copies of the Software, and to permit persons to whom the Software is
-- furnished to do so, subject to the following conditions:
--
-- The above copyright notice and this permission notice shall be included in
-- all copies or substantial portions of the Software.
--
-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
-- IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
-- FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
-- AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
-- LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
-- OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
-- SOFTWARE.

DROP INDEX IF EXISTS idx_trust_center_accesses_identity_id_organization_id;

ALTER TABLE trust_center_accesses
    ADD CONSTRAINT trust_center_accesses_identity_id_trust_center_id_key
    UNIQUE (identity_id, trust_center_id);

ALTER TABLE trust_center_files
    ADD COLUMN trust_center_id TEXT REFERENCES trust_centers(id) ON UPDATE CASCADE ON DELETE CASCADE;

UPDATE trust_center_files tcf
SET trust_center_id = tc.id
FROM trust_centers tc
WHERE tc.organization_id = tcf.organization_id
    AND (
        SELECT COUNT(*)
        FROM trust_centers tc2
        WHERE tc2.organization_id = tcf.organization_id
    ) = 1;

DELETE FROM trust_center_files
WHERE trust_center_id IS NULL;

ALTER TABLE trust_center_files
    ALTER COLUMN trust_center_id SET NOT NULL;

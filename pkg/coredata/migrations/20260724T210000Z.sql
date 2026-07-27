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

ALTER TABLE electronic_signatures
    ADD COLUMN trust_center_id TEXT REFERENCES trust_centers(id) ON DELETE SET NULL;

ALTER TABLE electronic_signatures
    ADD COLUMN trust_center_entity_name_snapshot TEXT;

UPDATE electronic_signatures es
SET
    trust_center_id = tca.trust_center_id,
    trust_center_entity_name_snapshot = tc.entity_name
FROM trust_center_accesses tca
JOIN trust_centers tc ON tc.id = tca.trust_center_id
WHERE tca.electronic_signature_id = es.id;

ALTER TABLE rights_requests
    ADD COLUMN trust_center_id TEXT REFERENCES trust_centers(id) ON DELETE SET NULL;

UPDATE rights_requests rr
SET trust_center_id = tc.id
FROM trust_centers tc
WHERE tc.organization_id = rr.organization_id
    AND (
        SELECT COUNT(*)
        FROM trust_centers tc2
        WHERE tc2.organization_id = rr.organization_id
    ) = 1;

-- Portal-scoped rights-request history is looked up by (trust_center_id,
-- contact); without this index that lookup degrades to a table scan.
CREATE INDEX rights_requests_trust_center_id_contact_idx
    ON rights_requests (trust_center_id, contact);

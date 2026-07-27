// Copyright (c) 2026 Probo Inc <hello@probo.com>.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { Badge } from "@probo/ui";
import { useTranslation } from "react-i18next";
import { useFragment } from "react-relay";
import { Link } from "react-router";
import { graphql } from "relay-runtime";

import type {
  CompliancePortalListItem_compliancePortal$key,
} from "#/__generated__/core/CompliancePortalListItem_compliancePortal.graphql";
import { useOrganizationId } from "#/hooks/useOrganizationId";

const compliancePortalFragment = graphql`
  fragment CompliancePortalListItem_compliancePortal on CompliancePortal {
    id
    entityName
    active
    publicUrl
    createdAt
  }
`;

interface CompliancePortalListItemProps {
  compliancePortalKey: CompliancePortalListItem_compliancePortal$key;
}

export function CompliancePortalListItem({ compliancePortalKey }: CompliancePortalListItemProps) {
  const { t, i18n } = useTranslation("organizations/compliance-pages");
  const organizationId = useOrganizationId();

  const compliancePortal = useFragment<CompliancePortalListItem_compliancePortal$key>(
    compliancePortalFragment,
    compliancePortalKey,
  );

  return (
    <Link
      to={`/organizations/${organizationId}/compliance-pages/${compliancePortal.id}`}
      className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="font-medium">{compliancePortal.entityName}</div>
        <div className="text-sm text-muted-foreground truncate">
          {compliancePortal.publicUrl}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={compliancePortal.active ? "success" : "danger"}>
          {compliancePortal.active
            ? t("overviewPage.status.active")
            : t("overviewPage.status.inactive")}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(compliancePortal.createdAt).toLocaleDateString(i18n.language)}
        </span>
      </div>
    </Link>
  );
}

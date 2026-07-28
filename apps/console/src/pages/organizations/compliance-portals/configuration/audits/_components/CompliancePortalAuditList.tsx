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

import { Table, Tbody, Td, Th, Thead, Tr } from "@probo/ui";
import { useTranslation } from "react-i18next";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";

import type { CompliancePortalAuditList_compliancePortalFragment$key } from "#/__generated__/core/CompliancePortalAuditList_compliancePortalFragment.graphql";
import type { CompliancePortalAuditList_organizationFragment$key } from "#/__generated__/core/CompliancePortalAuditList_organizationFragment.graphql";

import { CompliancePortalAuditListItem } from "./CompliancePortalAuditListItem";

const organizationFragment = graphql`
  fragment CompliancePortalAuditList_organizationFragment on Organization
  @argumentDefinitions(compliancePortalId: { type: "ID!" }) {
    audits(first: 100) {
      edges {
        node {
          id
          ...CompliancePortalAuditListItem_auditFragment
            @arguments(compliancePortalId: $compliancePortalId)
        }
      }
    }
  }
`;

const compliancePortalFragment = graphql`
  fragment CompliancePortalAuditList_compliancePortalFragment on CompliancePortal {
    ...CompliancePortalAuditListItem_compliancePortalFragment
  }
`;

export function CompliancePortalAuditList(props: {
  compliancePortalId: string;
  organizationRef: CompliancePortalAuditList_organizationFragment$key;
  compliancePortalRef: CompliancePortalAuditList_compliancePortalFragment$key;
}) {
  const { t } = useTranslation("organizations/compliance-portals");

  const { audits } = useFragment(organizationFragment, props.organizationRef);
  const compliancePortal = useFragment(compliancePortalFragment, props.compliancePortalRef);

  return (
    <div className="space-y-[10px]">
      <Table>
        <Thead>
          <Tr>
            <Th>{t("auditList.columns.framework")}</Th>
            <Th>{t("auditList.columns.name")}</Th>
            <Th>{t("auditList.columns.validUntil")}</Th>
            <Th>{t("auditList.columns.state")}</Th>
            <Th>{t("auditList.columns.visibility")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {audits.edges.length === 0 && (
            <Tr>
              <Td colSpan={5} className="text-center text-txt-secondary">
                {t("auditList.empty")}
              </Td>
            </Tr>
          )}
          {audits.edges.map(({ node: audit }) => (
            <CompliancePortalAuditListItem
              key={audit.id}
              compliancePortalId={props.compliancePortalId}
              auditFragmentRef={audit}
              compliancePortalFragmentRef={compliancePortal}
            />
          ))}
        </Tbody>
      </Table>
    </div>
  );
}

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

import type { CompliancePortalDocumentList_compliancePortalFragment$key } from "#/__generated__/core/CompliancePortalDocumentList_compliancePortalFragment.graphql";
import type { CompliancePortalDocumentList_organizationFragment$key } from "#/__generated__/core/CompliancePortalDocumentList_organizationFragment.graphql";

import { CompliancePortalDocumentListItem } from "./CompliancePortalDocumentListItem";

const organizationFragment = graphql`
  fragment CompliancePortalDocumentList_organizationFragment on Organization
  @argumentDefinitions(compliancePortalId: { type: "ID!" }) {
    documents(first: 100 filter: { status: [ACTIVE] }) {
      edges {
        node {
          id
          currentPublishedMajor
          ...CompliancePortalDocumentListItem_documentFragment
            @arguments(compliancePortalId: $compliancePortalId)
        }
      }
    }
  }
`;

const compliancePortalFragment = graphql`
  fragment CompliancePortalDocumentList_compliancePortalFragment on CompliancePortal {
    ...CompliancePortalDocumentListItem_compliancePortalFragment
  }
`;

export function CompliancePortalDocumentList(props: {
  compliancePortalId: string;
  organizationRef: CompliancePortalDocumentList_organizationFragment$key;
  compliancePortalRef: CompliancePortalDocumentList_compliancePortalFragment$key;
}) {
  const { t } = useTranslation("organizations/compliance-portals");

  const { documents } = useFragment(organizationFragment, props.organizationRef);
  const compliancePortal = useFragment(compliancePortalFragment, props.compliancePortalRef);
  const publishedDocuments = documents.edges.filter(({ node }) => node.currentPublishedMajor != null);

  return (
    <div className="space-y-[10px]">
      <Table>
        <Thead>
          <Tr>
            <Th>{t("documentList.columns.name")}</Th>
            <Th>{t("documentList.columns.type")}</Th>
            <Th>{t("documentList.columns.alias")}</Th>
            <Th>{t("documentList.columns.visibility")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {publishedDocuments.length === 0 && (
            <Tr>
              <Td colSpan={4} className="text-center text-txt-secondary">
                {t("documentList.empty")}
              </Td>
            </Tr>
          )}
          {publishedDocuments.map(({ node: document }) => (
            <CompliancePortalDocumentListItem
              key={document.id}
              compliancePortalId={props.compliancePortalId}
              compliancePortalFragmentRef={compliancePortal}
              documentFragmentRef={document}
            />
          ))}
        </Tbody>
      </Table>
    </div>
  );
};

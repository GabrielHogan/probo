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

import { getAuditStateVariant, getCompliancePortalVisibilityOptions } from "@probo/helpers";
import { dateFormat } from "@probo/i18n";
import { Badge, Field, Option, Td, Tr } from "@probo/ui";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";

import type {
  CompliancePortalAuditListItem_auditFragment$key,
} from "#/__generated__/core/CompliancePortalAuditListItem_auditFragment.graphql";
import type {
  CompliancePortalAuditListItem_compliancePortalFragment$key,
} from "#/__generated__/core/CompliancePortalAuditListItem_compliancePortalFragment.graphql";
import type {
  CompliancePortalAuditListItem_updateAuditVisibilityMutation,
} from "#/__generated__/core/CompliancePortalAuditListItem_updateAuditVisibilityMutation.graphql";
import { useOrganizationId } from "#/hooks/useOrganizationId";
import { useMutation } from "#/lib/relay/useMutation";

const compliancePortalFragment = graphql`
  fragment CompliancePortalAuditListItem_compliancePortalFragment on CompliancePortal {
    canUpdate: permission(action: "compliance-portal:portal:update")
  }
`;

const auditFragment = graphql`
  fragment CompliancePortalAuditListItem_auditFragment on Audit
  @argumentDefinitions(compliancePortalId: { type: "ID!" }) {
    id
    name
    framework {
      name
    }
    validUntil
    state
    compliancePortalVisibility(compliancePortalId: $compliancePortalId)
  }
`;

const updateAuditVisibilityMutation = graphql`
  mutation CompliancePortalAuditListItem_updateAuditVisibilityMutation(
    $input: UpdateCompliancePortalAuditVisibilityInput!
    $compliancePortalId: ID!
  ) {
    updateCompliancePortalAuditVisibility(input: $input) {
      audit {
        ...CompliancePortalAuditListItem_auditFragment
          @arguments(compliancePortalId: $compliancePortalId)
      }
    }
  }
`;

export function CompliancePortalAuditListItem(props: {
  compliancePortalId: string;
  auditFragmentRef: CompliancePortalAuditListItem_auditFragment$key;
  compliancePortalFragmentRef: CompliancePortalAuditListItem_compliancePortalFragment$key;
}) {
  const { compliancePortalId, auditFragmentRef, compliancePortalFragmentRef } = props;

  const organizationId = useOrganizationId();
  const { i18n, t } = useTranslation("organizations/compliance-portals");

  const compliancePortal = useFragment<CompliancePortalAuditListItem_compliancePortalFragment$key>(
    compliancePortalFragment,
    compliancePortalFragmentRef,
  );
  const audit = useFragment<CompliancePortalAuditListItem_auditFragment$key>(auditFragment, auditFragmentRef);

  const [updateAuditVisibility, isUpdatingAuditVisibility] = useMutation<
    CompliancePortalAuditListItem_updateAuditVisibilityMutation
  >(
    updateAuditVisibilityMutation,
    {
      successMessage: t("auditListItem.messages.visibilityUpdated"),
      errorToast: t("auditListItem.errors.updateVisibility"),
    },
  );
  const handleVisibilityChange = useCallback(
    async (value: string) => {
      const stringValue = typeof value === "string" ? value : "";
      const typedValue = stringValue as "NONE" | "PRIVATE" | "PUBLIC";
      await updateAuditVisibility({
        variables: {
          input: {
            compliancePortalId,
            auditId: audit.id,
            compliancePortalVisibility: typedValue,
          },
          compliancePortalId,
        },
      });
    },
    [compliancePortalId, audit.id, updateAuditVisibility],
  );

  const visibilityOptions = getCompliancePortalVisibilityOptions(t);
  const validUntilFormatted = audit.validUntil
    ? dateFormat(i18n.language, audit.validUntil)
    : t("auditListItem.noExpiry");

  return (
    <Tr to={`/organizations/${organizationId}/audits/${audit.id}`}>
      <Td>
        <div className="flex gap-4 items-center">{audit.framework?.name}</div>
      </Td>
      <Td>{audit.name || t("auditListItem.untitled")}</Td>
      <Td>{validUntilFormatted}</Td>
      <Td>
        <Badge variant={getAuditStateVariant(audit.state)}>
          {t(`auditListItem.states.${audit.state.toLowerCase()}`)}
        </Badge>
      </Td>
      <Td noLink width={130} className="pr-0">
        <Field
          type="select"
          value={audit.compliancePortalVisibility}
          onValueChange={value => void handleVisibilityChange(value)}
          disabled={isUpdatingAuditVisibility || !compliancePortal.canUpdate}
          className="w-[105px]"
        >
          {visibilityOptions.map(option => (
            <Option key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <Badge variant={option.variant}>{option.label}</Badge>
              </div>
            </Option>
          ))}
        </Field>
      </Td>
    </Tr>
  );
}

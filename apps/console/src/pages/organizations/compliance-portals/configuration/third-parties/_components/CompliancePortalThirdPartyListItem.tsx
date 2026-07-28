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

import { Badge, Button, IconCheckmark1, IconCrossLargeX, Td, Tr } from "@probo/ui";
import { useTranslation } from "react-i18next";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";

import type { CompliancePortalThirdPartyListItem_thirdPartyFragment$key } from "#/__generated__/core/CompliancePortalThirdPartyListItem_thirdPartyFragment.graphql";
import type { CompliancePortalThirdPartyListItemMutation } from "#/__generated__/core/CompliancePortalThirdPartyListItemMutation.graphql";
import { useOrganizationId } from "#/hooks/useOrganizationId";
import { useMutation } from "#/lib/relay/useMutation";

const thirdPartyFragment = graphql`
  fragment CompliancePortalThirdPartyListItem_thirdPartyFragment on ThirdParty
  @argumentDefinitions(compliancePortalId: { type: "ID!" }) {
    id
    category
    name
    showOnCompliancePortal: compliancePortalPublished(compliancePortalId: $compliancePortalId)
    canUpdate: permission(action: "core:thirdParty:update")
  }
`;

const updateThirdPartyVisibilityMutation = graphql`
  mutation CompliancePortalThirdPartyListItemMutation(
    $input: UpdateCompliancePortalThirdPartyPublishedInput!
    $compliancePortalId: ID!
  ) {
    updateCompliancePortalThirdPartyPublished(input: $input) {
      thirdParty {
        id
        ...CompliancePortalThirdPartyListItem_thirdPartyFragment
          @arguments(compliancePortalId: $compliancePortalId)
      }
    }
  }
`;

export function CompliancePortalThirdPartyListItem(props: {
  compliancePortalId: string;
  thirdPartyFragmentRef: CompliancePortalThirdPartyListItem_thirdPartyFragment$key;
}) {
  const { compliancePortalId, thirdPartyFragmentRef } = props;

  const organizationId = useOrganizationId();
  const { t } = useTranslation("organizations/compliance-portals");

  const thirdParty = useFragment<CompliancePortalThirdPartyListItem_thirdPartyFragment$key>(
    thirdPartyFragment,
    thirdPartyFragmentRef,
  );
  const [updateThirdPartyVisibility, isUpadtingThirdPartyVisibility] = useMutation<
    CompliancePortalThirdPartyListItemMutation
  >(
    updateThirdPartyVisibilityMutation,
    {
      successMessage: t("thirdPartyListItem.messages.visibilityUpdated"),
      errorToast: t("thirdPartyListItem.errors.visibilityUpdate"),
    },
  );

  return (
    <Tr to={`/organizations/${organizationId}/third-parties/${thirdParty.id}/overview`}>
      <Td>
        <div className="flex gap-4 items-center">{thirdParty.name}</div>
      </Td>
      <Td>
        <Badge variant="neutral">{thirdParty.category}</Badge>
      </Td>
      <Td>
        <Badge variant={thirdParty.showOnCompliancePortal ? "success" : "danger"}>
          {thirdParty.showOnCompliancePortal ? t("thirdPartyListItem.visibility.visible") : t("thirdPartyListItem.visibility.none")}
        </Badge>
      </Td>
      <Td noLink width={100} className="text-end">
        {thirdParty.canUpdate && (
          <Button
            variant="secondary"
            onClick={() =>
              void updateThirdPartyVisibility({
                variables: {
                  input: {
                    compliancePortalId,
                    thirdPartyId: thirdParty.id,
                    published: !thirdParty.showOnCompliancePortal,
                  },
                  compliancePortalId,
                },
              })}
            icon={thirdParty.showOnCompliancePortal ? IconCrossLargeX : IconCheckmark1}
            disabled={isUpadtingThirdPartyVisibility}
          >
            {thirdParty.showOnCompliancePortal ? t("thirdPartyListItem.actions.hide") : t("thirdPartyListItem.actions.show")}
          </Button>
        )}
      </Td>
    </Tr>
  );
};

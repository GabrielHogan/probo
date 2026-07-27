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

package update

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
	"go.probo.inc/probo/pkg/cli/api"
	"go.probo.inc/probo/pkg/cmd/cmdutil"
)

const updateMutation = `
mutation($input: UpdateCompliancePortalAuditVisibilityInput!, $compliancePortalId: ID!) {
  updateCompliancePortalAuditVisibility(input: $input) {
    audit {
      id
      compliancePortalVisibility(compliancePortalId: $compliancePortalId)
    }
  }
}
`

type updateResponse struct {
	UpdateCompliancePortalAuditVisibility struct {
		Audit struct {
			ID                         string `json:"id"`
			CompliancePortalVisibility string `json:"compliancePortalVisibility"`
		} `json:"audit"`
	} `json:"updateCompliancePortalAuditVisibility"`
}

func NewCmdUpdate(f *cmdutil.Factory) *cobra.Command {
	var (
		flagPortal     string
		flagVisibility string
	)

	cmd := &cobra.Command{
		Use:   "update <audit-id>",
		Short: "Update an audit visibility on a compliance portal",
		Example: `  # Publish an audit report publicly on a compliance portal
  prb compliance-portal audit update <audit-id> --portal <compliance-portal-id> --visibility PUBLIC

  # Remove an audit report from a compliance portal
  prb compliance-portal audit update <audit-id> --portal <compliance-portal-id> --visibility NONE`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := cmdutil.ValidateEnum(
				"visibility",
				flagVisibility,
				[]string{"NONE", "PRIVATE", "PUBLIC"},
			); err != nil {
				return err
			}

			cfg, err := f.Config()
			if err != nil {
				return err
			}

			host, hc, err := cfg.DefaultHost()
			if err != nil {
				return err
			}

			client := api.NewClient(
				host,
				hc.Token,
				"/api/console/v1/graphql",
				cfg.HTTPTimeoutDuration(),
				cmdutil.TokenRefreshOption(cfg, host, hc),
			)

			data, err := client.Do(
				updateMutation,
				map[string]any{
					"input": map[string]any{
						"compliancePortalId":         flagPortal,
						"auditId":                    args[0],
						"compliancePortalVisibility": flagVisibility,
					},
					"compliancePortalId": flagPortal,
				},
			)
			if err != nil {
				return err
			}

			var resp updateResponse
			if err := json.Unmarshal(data, &resp); err != nil {
				return fmt.Errorf("cannot parse response: %w", err)
			}

			a := resp.UpdateCompliancePortalAuditVisibility.Audit
			_, _ = fmt.Fprintf(
				f.IOStreams.Out,
				"Updated audit %s visibility to %s on compliance portal %s\n",
				a.ID,
				a.CompliancePortalVisibility,
				flagPortal,
			)

			return nil
		},
	}

	cmd.Flags().StringVar(&flagPortal, "portal", "", "Compliance portal ID (required)")
	cmd.Flags().StringVar(&flagVisibility, "visibility", "", "Compliance portal visibility: NONE, PRIVATE, PUBLIC (required)")
	_ = cmd.MarkFlagRequired("portal")
	_ = cmd.MarkFlagRequired("visibility")

	return cmd
}

import React from "react";
import BaseLayout from "../layouts/BaseLayout";
import Text from "../components/Text";
import Section from "../components/Section";
import Button from "../components/Button";
import { BASE_URL, BRAND } from "../branding";

type Props = {
    userName: string;
    reason: string;
};

export const KYCRejectedSubject = "Action Required: Your Verification Documents Need Review - Planuxe";

const KYCRejected = ({ userName, reason, }: Props) => {
    const resubmitLink = `${BASE_URL}/dashboard/kyc`;
    return (
        <BaseLayout title="KYC Rejected">
            <Section>
                <Text bold size={20} style={{ color: '#dc3545' }}>
                    ❌ Verification Not Approved
                </Text>

                <Text>Hello, {userName}</Text>
                <Text>
                    Unfortunately, we were unable to approve your Know Your Customer (KYC) documents at this time.
                </Text>

                <Text bold style={{ marginTop: '12px' }}>
                    Reason for Rejection:
                </Text>
                <blockquote style={{ borderLeft: `3px solid ${BRAND.buttonColor}`, paddingLeft: '10px', margin: '8px 0 16px', color: BRAND.muted }}>
                    {reason}
                </blockquote>

                <Text>
                    Please review the reason and resubmit the necessary documentation to complete your account verification.
                </Text>

                <Button href={resubmitLink} >Resubmit Documents</Button>

                <Text>
                    If you have any questions, please contact our support team.
                </Text>
            </Section>
        </BaseLayout>
    );
};

export default KYCRejected;
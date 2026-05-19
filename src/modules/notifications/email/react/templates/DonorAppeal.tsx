import React from "react";
import BaseLayout from "../layouts/BaseLayout";
import Text from "../components/Text";
import Section from "../components/Section";

type Props = {
    title: string;
    message: string;
    bloodGroup: string;
};

const DonorAppeal = ({ title, message, bloodGroup }: Props) => {
    const audienceLabel =
        bloodGroup === "ALL" ? "all blood groups" : `${bloodGroup} donors`;

    return (
        <BaseLayout
            title={title}
            preheader={`Urgent blood appeal for ${audienceLabel}`}
        >
            <Section>
                <Text bold size={20} style={{ color: "#b91c1c" }}>
                    Urgent Blood Appeal
                </Text>

                <Text>
                    We are reaching out to request support from{" "}
                    <strong>{audienceLabel}</strong>.
                </Text>

                <Text>{message}</Text>

                <Text>
                    If you are eligible to donate, please visit your nearest
                    donation center as soon as possible.
                </Text>

                <Text small>Thank you for helping save lives.</Text>
            </Section>
        </BaseLayout>
    );
};

export default DonorAppeal;

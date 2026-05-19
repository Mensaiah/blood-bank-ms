import React, { ComponentType, ReactElement } from "react";
import ReactDOMServer from "react-dom/server";

interface TemplateProps {
    [key: string]: string | number;
}

export const renderTemplate = <P extends TemplateProps>(
    Component: ComponentType<P>,
    props: P,
): string => {
    return ReactDOMServer.renderToStaticMarkup(
        React.createElement(Component, props) as ReactElement,
    );
};

import React, { PropsWithChildren } from "react";

const Section: React.FC<PropsWithChildren<{ style?: React.CSSProperties }>> = ({
  children,
  style,
}) => {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
      <tbody>
        <tr>
          <td style={{ padding: "0 24px", ...style }}>{children}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default Section;

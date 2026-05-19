import React from "react";
import { BRAND } from "../branding";

type Props = { href: string; children: React.ReactNode };

const Button: React.FC<Props> = ({ href, children }) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    style={{ margin: "16px 0" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            backgroundColor: BRAND.buttonColor,
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <a
            href={href}
            style={{
              display: "inline-block",
              padding: "12px 18px",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            {children}
          </a>
        </td>
      </tr>
    </tbody>
  </table>
);

export default Button;

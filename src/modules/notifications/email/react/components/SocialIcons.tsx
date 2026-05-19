import React from "react";
import { ASSETS, BRAND } from "../branding";

const SocialIcons: React.FC = () => {
  const size = 24; // px
  const gap = 20; // px

  const items: Array<{ href: string; src: string; alt: string }> = [
    { href: BRAND.social.instagram, src: ASSETS.instagram, alt: "Instagram" },
    { href: BRAND.social.x, src: ASSETS.x, alt: "X" },
    { href: BRAND.social.linkedin, src: ASSETS.linkedin, alt: "LinkedIn" },
    { href: BRAND.social.facebook, src: ASSETS.facebook, alt: "Facebook" },
  ];

  return (
    <table role="presentation" align="center" cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr>
          {items.map((it, i) => (
            <td key={it.alt} style={{ paddingLeft: i === 0 ? 0 : gap }}>
              <a href={it.href}>
                <img
                  src={it.src}
                  width={size}
                  height={size}
                  alt={it.alt}
                  style={{
                    display: "block",
                    border: 0,
                    outline: 0,
                    textDecoration: "none",
                  }}
                />
              </a>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default SocialIcons;

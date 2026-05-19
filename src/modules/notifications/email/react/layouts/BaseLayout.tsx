import React, { PropsWithChildren } from "react";
import { BRAND, ASSETS } from "../branding";

type Props = {
  title: string;
  preheader?: string;
};

const BaseLayout: React.FC<PropsWithChildren<Props>> = ({
  title,
  preheader,
  children,
}) => {
  const year = new Date().getFullYear();
  const maxWidth = BRAND.maxWidth;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <style>
          {`
            body, table, td { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
            a { color: #1a56db; }
          `}
        </style>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: BRAND.bodyBg }}>
        {preheader ? (
          <div
            style={{
              display: "none",
              overflow: "hidden",
              lineHeight: 1,
              maxHeight: 0,
              maxWidth: 0,
              opacity: 0,
            }}
          >
            {preheader}
          </div>
        ) : null}

        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
          <tbody>
            <tr>
              <td style={{ padding: "24px 0" }}>
                <table
                  align="center"
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    width: "100%",
                    maxWidth: `${maxWidth}px`,
                    backgroundColor: BRAND.cardBg,
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          backgroundColor: BRAND.barColor,
                          padding: "14px 20px",
                        }}
                      >
                        <table
                          role="presentation"
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                        >
                          <tbody>
                            <tr>
                              <td style={{ verticalAlign: "middle" }}>
                                <table
                                  role="presentation"
                                  cellPadding={0}
                                  cellSpacing={0}
                                >
                                  <tbody>
                                    <tr>
                                      <td style={{ paddingRight: 8 }}>
                                        <img
                                          src={ASSETS.logo}
                                          alt="Planuxe Logo"
                                          style={{
                                            display: "block",
                                            border: 0,
                                            outline: 0,
                                            maxHeight: "40px",
                                            height: "auto",
                                            width: "auto",
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td />
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: "20px 24px 28px" }}>{children}</td>
                    </tr>
                  </tbody>
                </table>

                <table
                  align="center"
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    width: "100%",
                    maxWidth: `${maxWidth}px`,
                    marginTop: 16,
                  }}
                >
                  <tbody>
                    <tr>
                      <td align="center" style={{ padding: "16px 12px 0" }}>
                        <table
                          role="presentation"
                          cellPadding={0}
                          cellSpacing={0}
                        >
                          <tbody>
                        <tr>
                          <td>
                            <table
                              role="presentation"
                              align="center"
                              cellPadding={0}
                              cellSpacing={0}
                            >
                              <tbody>
                                <tr>
                                  <td>
                                    <a href={BRAND.social.instagram}>
                                      <img
                                        src={`${ASSETS.instagram}`}
                                        width={24}
                                        height={24}
                                        alt="Instagram"
                                        style={{
                                          display: "block",
                                          border: 0,
                                        }}
                                      />
                                    </a>
                                  </td>

                                  <td style={{ width: 20 }} />

                                  <td>
                                    <a href={BRAND.social.x}>
                                      <img
                                        src={`${ASSETS.x}`}
                                        width={24}
                                        height={24}
                                        alt="X"
                                        style={{
                                          display: "block",
                                          border: 0,
                                        }}
                                      />
                                    </a>
                                  </td>
                                  <td style={{ width: 20 }} />

                                  <td>
                                    <a href={BRAND.social.linkedin}>
                                      <img
                                        src={`${ASSETS.linkedin}`}
                                        width={24}
                                        height={24}
                                        alt="LinkedIn"
                                        style={{
                                          display: "block",
                                          border: 0,
                                        }}
                                      />
                                    </a>
                                  </td>
                                  <td style={{ width: 20 }} />

                                  <td>
                                    <a href={BRAND.social.facebook}>
                                      <img
                                        src={`${ASSETS.facebook}`}
                                        width={24}
                                        height={24}
                                        alt="Facebook"
                                        style={{
                                          display: "block",
                                          border: 0,
                                        }}
                                      />
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ height: 12 }} />
                        </tr>
                        <tr>
                          <td
                            align="center"
                            style={{
                              color: BRAND.muted,
                              fontSize: 13,
                              lineHeight: "20px",
                            }}
                          >
                            {BRAND.addressLines[0]}
                            <br />
                            {BRAND.addressLines[1]}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ height: 8 }} />
                        </tr>
                        <tr>
                          <td
                            align="center"
                            style={{ color: BRAND.muted, fontSize: 12 }}
                          >
                            {year} {BRAND.name}. All rights reserved.
                          </td>
                        </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
};

export default BaseLayout;

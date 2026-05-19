import React, { PropsWithChildren } from "react";

type Props = {
  size?: number;
  bold?: boolean;
  small?: boolean;
  style?: React.CSSProperties;
};

const Text: React.FC<PropsWithChildren<Props>> = ({
  children,
  size = 16,
  bold,
  style,
  small,
}) => {
  const fontSize = small ? 12 : size;
  return (
    <p
      style={{
        margin: "0 0 12px",
        fontSize: `${fontSize}px`,
        lineHeight: "1.5",
        color: "#222",
        fontWeight: bold ? 600 : 400,
        ...style,
      }}
    >
      {children}
    </p>
  );
};

export default Text;

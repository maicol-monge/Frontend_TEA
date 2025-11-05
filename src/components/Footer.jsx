import React from "react";

const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";

const Footer = () => (
    <footer
        className="text-center py-3 mt-auto"
        style={{
            background: COLOR_PRIMARY,
            color: "#fff",
            borderTop: `4px solid ${COLOR_ACCENT}`,
            fontWeight: "bold",
            letterSpacing: 1
        }}
    >
        <span>
            © {new Date().getFullYear()} Aplicación Diagnóstico TEA &nbsp;|&nbsp; UNICAES
        </span>
    </footer>
);

export default Footer;
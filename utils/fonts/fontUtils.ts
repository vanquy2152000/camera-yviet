import { Raleway } from "next/font/google";

const raleway_init = Raleway({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-raleway",
    display: "swap",
});

export const raleway_sans = raleway_init;
import "./styles.css";
import CssBaseline from "@mui/material/CssBaseline";

export default function MyApp({ Component, pageProps }) {
  return (
    <CssBaseline>
      <Component {...pageProps} />
    </CssBaseline>
  );
}

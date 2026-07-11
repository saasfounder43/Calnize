const ADSENSE_CLIENT = "ca-pub-2350824738301174";

/** Raw script tag so AdSense crawler sees it in server-rendered HTML. */
export default function AdSenseScript() {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}

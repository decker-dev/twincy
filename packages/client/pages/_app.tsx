import type {AppProps} from "next/app";

import {ChakraProvider} from "@chakra-ui/react";
import {useEffect} from "react";
import SocketIO from "socket.io-client";
import {useRouter} from "next/router";

import theme from "~/theme";

const socket = SocketIO("http://localhost:6600", {autoConnect: false});

const App: React.VFC<AppProps> = ({Component, pageProps}) => {
  const {
    query: {channel},
  } = useRouter();

  useEffect(() => {
    // Don't run this effect server side
    if (!process.browser) {
      return;
    }

    // Only connect if a channel is present
    if (channel) {
      socket.io.opts.query = {channel};
      socket.connect();
    }

    return () => {
      socket.io.opts.query = {};
      socket.disconnect();
    };
  }, [channel]);

  return (
    <ChakraProvider theme={theme}>
      <Component socket={socket} {...pageProps} />
    </ChakraProvider>
  );
};

export default App;

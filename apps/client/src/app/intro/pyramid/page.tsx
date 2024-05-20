import {Provider as SocketProvider} from "@/socket/context";
import PyramidScreen from "@/intro/screens/pyramid";

const IntroPyramidsPage = () => {
  return (
    <SocketProvider>
      <PyramidScreen />
    </SocketProvider>
  );
};

export default IntroPyramidsPage;

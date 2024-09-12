import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex } from "@radix-ui/themes";
import { Desktop } from "./Desktop";
import { Function } from "./Fuction";
import { createNetworkConfig,SuiClientProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { useState } from "react";

const { networkConfig}= createNetworkConfig({
	testnet: {url: getFullnodeUrl("testnet")},
	localnet: { url: getFullnodeUrl("localnet")}
});

function FileSystem() {
  const [hasRootDir,setHasRootDir] = useState(false);
  const [currentDirectoryId,setCurrentDirectoryId] = useState("");

  return (
    <SuiClientProvider networks={networkConfig} network="testnet">
      <Flex
        position="sticky"
        px="1"
        py="1"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}>
        <Box>
          <Function hasRootDir={hasRootDir} currentDirectoryId={currentDirectoryId} setCurrentDirectoryId={setCurrentDirectoryId}/>
        </Box>
        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <hr/>
      <Container>
        <Desktop setHasRootDir={setHasRootDir} setCurrentDirectoryId={setCurrentDirectoryId}/>
      </Container>
    	</SuiClientProvider>
  );
}

export default FileSystem;

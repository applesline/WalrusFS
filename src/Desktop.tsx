import { useCurrentAccount,useSuiClientQuery } from "@mysten/dapp-kit";
import { Container, Flex } from "@radix-ui/themes";
import { LoadFile } from './LoadFile';

export function Desktop({setHasRootDir,setCurrentDirectoryId}) {
  const account = useCurrentAccount();

  return (
    <Container my="2">
      {
        account ? (
          <Flex direction="row">
            <LoadFiles address={account.address} setHasRootDir={setHasRootDir} setCurrentDirectoryId={setCurrentDirectoryId}></LoadFiles>
          </Flex>
        ) : (
          <Flex direction="row">
            <div className="text-center">Wallet not connected</div>
          </Flex>
        )
      }
    </Container>
  );

  function LoadFiles({address,setHasRootDir,setCurrentDirectoryId}) {
    const {data} = useSuiClientQuery("getOwnedObjects",{owner:address,});
    if(!data) {
      return null;
    }
    return (
    <div>
      {data.data.map((object) => (
        <LoadFile objectId={object.data?.objectId? object.data.objectId:""} setHasRootDir={setHasRootDir} setCurrentDirectoryId={setCurrentDirectoryId}></LoadFile>
      ))}
    </div>
    )
  }
}

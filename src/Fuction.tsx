import { useRef,useState,useEffect} from 'react'
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useSignAndExecuteTransactionBlock,useSuiClientQuery } from "@mysten/dapp-kit";

export function Function({hasRootDir,currentDirectoryId,setCurrentDirectoryId}) {
    const {mutate: signAndExecuteTransactionBlock} = useSignAndExecuteTransactionBlock();
    const [showCreateDirectoryForm,setShowCreateDirectoryForm] = useState(false);
    const [showCreateFileForm,setShowCreateFileForm] = useState(false);
    const txb = new TransactionBlock();

    const PACKAGE_ID = "0x7a59511f38e563ea32995d2c22f340cb6c29885269dd1adecb533c1c13525688";

    const contextMenuRef = useRef(null)
    const [formData, setFormData] = useState({
      blobId:'',
      fileName: ''
    });
  
    const handleChange = (event) => {
      setFormData({
        ...formData,
        [event.target.name]: event.target.value,
      });
    };

    useEffect(()=>{
      const handleClickOutside = (event) => {
        if(contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
          setShowCreateDirectoryForm(false);
          setShowCreateFileForm(false);
        }
      }
      document.addEventListener("mousedown",handleClickOutside);
      return () => {
        document.removeEventListener("mousedown",handleClickOutside);
      }
    },[showCreateDirectoryForm,showCreateFileForm])

    return (
      <div>
         {!hasRootDir && (<button className='create-btn' onClick={() => {
            createRootDirectoryOnSui()
          }}>
          New Root Directory
        </button>)
      }
        <button className='create-btn' onClick={(event) => {
          event.preventDefault();
          setShowCreateDirectoryForm(true);
        }}>
          New Directory
        </button>
        {showCreateDirectoryForm && 
          (
            <div className='context-menu' ref={contextMenuRef}>
              <input name="fileName" placeholder='Input your directory name' value={formData.fileName} onChange={handleChange}/><br/>
              <button onClick={() => {
                createDirectoryOnSui(currentDirectoryId,formData.fileName)
              }}>Create Directory</button>
            </div>
          )
        }
        
        <button className='create-btn' onClick={(event) => {
          event.preventDefault();
          setShowCreateFileForm(true);
        }}>
          New File
        </button>
        {showCreateFileForm && 
          (
            <div className='context-menu' ref={contextMenuRef}>
              <input name="blobId" placeholder='Input your blob_id' value={formData.blobId} onChange={handleChange}/><br/>
              <input name="fileName" placeholder='Input your file name' value={formData.fileName} onChange={handleChange}/><br/>
              <button onClick={() => {
                createFileOnSui(currentDirectoryId,formData.fileName,formData.blobId)
              }}>Create File</button>
            </div>
          )
        }
      </div>
    );
    
    function createRootDirectoryOnSui() {
      txb.moveCall({
        target: "0x7a59511f38e563ea32995d2c22f340cb6c29885269dd1adecb533c1c13525688::file_system::create_root_directory",
        arguments: []
      });
      executeTxb(true,txb)
    }

    function createDirectoryOnSui(parentDirectory,name) {
      txb.moveCall({
        target: "0x7a59511f38e563ea32995d2c22f340cb6c29885269dd1adecb533c1c13525688::file_system::create_directory",
        arguments: [txb.object(parentDirectory), txb.pure.string(name)]
      });
      executeTxb(false,txb)
    }

    function createFileOnSui(parentDirectory,blobId,name) {
      txb.moveCall({
        target: "0x7a59511f38e563ea32995d2c22f340cb6c29885269dd1adecb533c1c13525688::file_system::create_file",
        arguments: [txb.object(parentDirectory),txb.pure.string(name), txb.pure.string(blobId)]
      });
      console.log(name)
      executeTxb(false,txb)
    }

    function executeTxb(isFirstTxb,txb) {
      signAndExecuteTransactionBlock(
        {transactionBlock: txb},
        {onSuccess: (result) => {
              console.log('executed transaction block', result);
              if(isFirstTxb) {
                const {data} = useSuiClientQuery("getTransactionBlock",{digest:result.digest});
                data.effects.created.map(item => {
                  let objectData = useSuiClientQuery("getObject",{id:item.reference.objectId,options:  {"showContent":true}});
                  // @ts-ignore
                  if(objectData?.data?.content?.type === PACKAGE_ID + "::file_system::Directory") {
                    // 获取创建的root directory的objectId
                    alert(item.reference.objectId)
                    setCurrentDirectoryId(item.reference.objectId);
                  }
                })
              }
              window.location.reload();
            },
        },
    );
    }
  }
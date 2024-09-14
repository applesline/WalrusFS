import { useRef,useState,useEffect} from 'react'
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";

export function Function({hasRootDir,currentDirectoryId}) {
    const {mutate: signAndExecuteTransactionBlock} = useSignAndExecuteTransactionBlock();
    const [showCreateDirectoryForm,setShowCreateDirectoryForm] = useState(false);
    const [showCreateFileForm,setShowCreateFileForm] = useState(false);
    const txb = new TransactionBlock();

    const Publisher = "https://publisher-devnet.walrus.space"
    const PackageId = "0x7a59511f38e563ea32995d2c22f340cb6c29885269dd1adecb533c1c13525688";
    const Module = "file_system";

    const contextMenuRef = useRef(null)
    const [formData, setFormData] = useState({
      blobId:'',
      fileName: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [isErr, setIsErr] = useState(false);
    const [tips,setTips] = useState("");

    const handleFileChange = (event) => {
        setSelectedFile( event.target.files[0]);
        setSelectedFileName(event.target.files[0].name)
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true)
        if(currentDirectoryId === "") {
          setTips("You need create a root directory first!")
          setIsErr(true);
          return
        } 
        if(selectedFile === null) {
          setTips("You need to select a file locally!")
          setIsErr(true);
          return
        } 
        setTips("Uploading to walrus...")
        setIsErr(false);
        // 创建 FormData 对象，用于将表单数据发送到服务器
        const formData = new FormData();
        formData.append('file', selectedFile);

        fetch(`${Publisher}/v1/store?epochs=5`, {
            method: 'PUT',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            let blobId = data.newlyCreated.blobObject.blobId;
            console.log('blobId=:', blobId);
            createFileOnSui(currentDirectoryId,selectedFileName,blobId)
        })
        .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
          setLoading(false);
        });;
    };
  
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
          setLoading(false)
        }}>
          New Directory
        </button>
        {showCreateDirectoryForm && 
          (
            <div className='context-menu' ref={contextMenuRef}>
              <input name="fileName" placeholder='Directory name' value={formData.fileName} onChange={handleChange}/><br/>
              <button className='create-txb-btn' onClick={() => {
                if(currentDirectoryId === "") {
                  setLoading(true);
                  setTips("You need create a root directory first!")
                  setIsErr(true)
                  return;
                }
                if(formData.fileName === "") {
                  setLoading(true);
                  setTips("You need to name your folder!")
                  setIsErr(true)
                  return;
                }
                createDirectoryOnSui(currentDirectoryId,formData.fileName)
              }}>Create Directory</button>
              {loading && <div style={{textAlign:"center",color:"red"}}>{tips}</div>}
            </div>
          )
        }
        
        <button className='create-btn' onClick={(event) => {
          event.preventDefault();
          setShowCreateFileForm(true);
          setLoading(false)
        }}>
          New File
        </button>
        {showCreateFileForm && 
          (
            <div className='context-menu' ref={contextMenuRef}>
              <form onSubmit={handleSubmit} style={{margin:"auto"}}>
                <label htmlFor="file-upload" className="custom-file-upload">
                  [Select Your File]  {selectedFileName}
                </label>
                <input id="file-upload" type="file" onChange={handleFileChange} style={{display: "none"}}/><br/>
                <button className='create-txb-btn' type="submit">Upload to walrus</button>
                {loading && <div style={isErr?{textAlign:"center",color:"red"}:{textAlign:"center",color:"blue"}}>{tips}</div>}
              </form>
            </div>
          )
        }
      </div>
    );
    
    function createRootDirectoryOnSui() {
      txb.moveCall({
        target: `${PackageId}::${Module}::create_root_directory`,
        arguments: []
      });
      executeTxb(txb)
    }

    function createDirectoryOnSui(parentDirectory,name) {
      txb.moveCall({
        target: `${PackageId}::${Module}::create_directory`,
        arguments: [txb.object(parentDirectory), txb.pure.string(name)]
      });
      executeTxb(txb)
    }

    function createFileOnSui(parentDirectory,blobId,name) {
      txb.moveCall({
        target: `${PackageId}::${Module}::create_file`,
        arguments: [txb.object(parentDirectory),txb.pure.string(name), txb.pure.string(blobId)]
      });
      executeTxb(txb)
      // createRootDirectoryOnSui();
    }

    function executeTxb(txb) {
      signAndExecuteTransactionBlock(
        {transactionBlock: txb},
        {onSuccess: (result) => {
            console.log('executed transaction block', result);
            window.location.reload();
          },
        },
     );
    }

    // function loadObjectIdWithDigest(digest) {
    //   const {data} = useSuiClientQuery("getTransactionBlock",{digest:digest});
    //   data.effects.created.map(item => {
    //     let objectData = useSuiClientQuery("getObject",{id:item.reference.objectId,options:  {"showContent":true}});
    //     // @ts-ignore
    //     if(objectData?.data?.content?.type === `${PackageId}::${Module}::Directory`) {
    //       // 获取创建的root directory的objectId
    //       console.log(item.reference.objectId)
    //       setCurrentDirectoryId(item.reference.objectId);
    //       window.location.reload();
    //     }
    //   })
    // }
  }